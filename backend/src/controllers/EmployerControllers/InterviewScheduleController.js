const supabase = require('../../supabase/config');
// const redis = require('../../redis/config');
const sendEmailService = require('../../services/sendEmailService');

class InterviewScheduleController {
    async createInterviewSchedule(req, res) {
        const {
            candidate_id,
            job_id,
            employer_id,
            interview_datetime,
            location,
            duration,
            email_type = 'formal',
            send_email = true,
        } = req.body;

        if (
            !candidate_id ||
            !job_id ||
            !employer_id ||
            !interview_datetime ||
            !location ||
            !duration
        ) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate và convert interview_datetime
        let validDateTime;
        try {
            // Nếu datetime đã đúng định dạng ISO
            if (
                interview_datetime.includes('T') ||
                interview_datetime.match(/^\d{4}-\d{2}-\d{2}/)
            ) {
                validDateTime = new Date(interview_datetime).toISOString();
            }
            // Nếu datetime có định dạng dd/mm/yyyy - hh:mm
            else if (
                interview_datetime.includes('/') &&
                interview_datetime.includes(' - ')
            ) {
                const [datePart, timePart] = interview_datetime.split(' - ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute] = timePart.split(':');

                const date = new Date(year, month - 1, day, hour, minute);
                validDateTime = date.toISOString();
            }
            // Các định dạng khác
            else {
                validDateTime = new Date(interview_datetime).toISOString();
            }

            // Kiểm tra date có hợp lệ không
            if (isNaN(Date.parse(validDateTime))) {
                throw new Error('Invalid date format');
            }
        } catch (dateError) {
            return res.status(400).json({
                error: 'Invalid interview_datetime format',
                details:
                    'Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) or dd/mm/yyyy - hh:mm',
                example: '2025-09-25T14:00:00.000Z or 25/09/2025 - 14:00',
            });
        }

        try {
            // 1. Tạo interview schedule với thời gian đã validate
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('interview_schedules')
                .insert({
                    candidate_id,
                    job_id,
                    employer_id,
                    interview_datetime: validDateTime, // Sử dụng thời gian đã convert
                    location,
                    duration,
                })
                .select()
                .single();

            if (scheduleError) {
                throw scheduleError;
            }

            console.log('Interview schedule created:', scheduleData);

            // 2. Nếu cần gửi email, lấy thông tin để gửi
            let emailResult = null;
            if (send_email) {
                try {
                    // Lấy thông tin candidate (email)
                    const { data: candidateData, error: candidateError } =
                        await supabase
                            .from('candidates')
                            .select(
                                `
                            user_id,
                            users!inner(email)
                        `,
                            )
                            .eq('user_id', candidate_id)
                            .single();

                    if (candidateError) {
                        throw candidateError;
                    }

                    // Lấy thông tin employer (company name)
                    const { data: employerData, error: employerError } =
                        await supabase
                            .from('employers')
                            .select('company_name')
                            .eq('user_id', employer_id)
                            .single();
                    if (employerError) {
                        throw employerError;
                    }

                    // // Lấy thông tin job (title, position)
                    // const { data: jobData, error: jobError } = await supabase
                    //     .from('jobs')
                    //     .select('title, position_level, description')
                    //     .eq('id', job_id)
                    //     .single();

                    // if (jobError) {
                    //     throw jobError;
                    // }

                    console.log('Email data collected:', {
                        candidate: candidateData,
                        employer: employerData,
                    });

                    // Kiểm tra có đủ thông tin gửi email không
                    if (
                        candidateData?.users?.email &&
                        employerData?.company_name
                    ) {
                        // Format thời gian cho email (chỉ cho hiển thị, không cho database)
                        const interviewDate = new Date(validDateTime);
                        const formattedDateTime = interviewDate.toLocaleString(
                            'vi-VN',
                            {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        );

                        // Chuẩn bị data cho email
                        const emailData = {
                            toEmail: candidateData.users.email,
                            emailType: email_type,
                            emailDateTime: formattedDateTime,
                            emailLocation: location,
                            emailDuration: duration,
                            companyName: employerData.company_name,
                            employerId: employer_id,
                        };

                        console.log('Sending email with data:', emailData);

                        // Gửi email với đúng thứ tự tham số
                        // sendEmailService(toEmail, emailType, emailDateTime, emailLocation, companyName, emailDuration, employerId)
                        emailResult = await sendEmailService(
                            emailData.toEmail,
                            emailData.emailType,
                            emailData.emailDateTime,
                            emailData.emailLocation,
                            emailData.companyName,
                            emailData.emailDuration,
                            emailData.employerId,
                        );

                        console.log('Email sent result:', emailResult);
                    } else {
                        emailResult = {
                            success: false,
                            error: 'Missing candidate email or company information',
                        };
                        console.log('Cannot send email - missing data:', {
                            hasEmail: !!candidateData?.users?.email,
                            hasCompany: !!employerData?.company_name,
                        });
                    }
                } catch (emailError) {
                    console.error('Error in email process:', emailError);
                    emailResult = {
                        success: false,
                        error: emailError.message,
                    };
                }
            }

            // 3. Response
            const response = {
                success: true,
                message: 'Interview schedule created successfully',
                data: scheduleData,
                email: emailResult
                    ? {
                          sent: emailResult.success,
                          recipient: emailResult.success
                              ? candidateData?.users?.email
                              : null,
                          emailType: email_type,
                          messageId: emailResult.messageId || null,
                          subject: emailResult.subject || null,
                          error: emailResult.error || null,
                      }
                    : {
                          sent: false,
                          reason: 'Email sending disabled',
                      },
            };

            if (emailResult?.success) {
                response.message =
                    'Interview schedule created and email sent successfully';
            } else if (emailResult && !emailResult.success) {
                response.message =
                    'Interview schedule created but email failed to send';
            }

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating interview schedule:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create interview schedule',
                details: error.message,
            });
        }
    }

    async getInterviewSchedulesByCompany(req, res) {
        const { employer_id } = req.params;

        if (!employer_id) {
            return res.status(400).json({ error: 'Employer ID is required' });
        }

        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select('*')
                .eq('employer_id', employer_id)
                .order('interview_datetime', { ascending: true });

            if (error) {
                throw error;
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error getting interview schedules:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get interview schedules',
            });
        }
    }

    async updateInterviewSchedule(req, res) {
        const { scheduleId } = req.params;
        const {
            interview_datetime,
            location,
            duration,
            send_notification_email = true, // Mặc định gửi email khi update
            email_type = 'formal',
        } = req.body;

        try {
            // Update schedule
            const { data: updatedSchedule, error } = await supabase
                .from('interview_schedules')
                .update({
                    interview_datetime,
                    location,
                    duration,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', scheduleId)
                .select(
                    `
                    *,
                    candidates(full_name, users(email)),
                    jobs(title),
                    employers(company_name)
                `,
                )
                .single();

            if (error) {
                throw error;
            }

            // Gửi email thông báo thay đổi nếu cần
            let emailResult = null;
            if (
                send_notification_email &&
                updatedSchedule.candidates?.users?.email
            ) {
                const emailData = {
                    toEmail: updatedSchedule.candidates.users.email,
                    candidateName: updatedSchedule.candidates.full_name,
                    emailType: 'update_notification',
                    emailDateTime: new Date(interview_datetime).toLocaleString(
                        'vi-VN',
                    ),
                    emailLocation: location,
                    emailDuration: duration,
                    companyName: updatedSchedule.employers.company_name,
                    jobTitle: updatedSchedule.jobs.title,
                };

                // Gửi email thông báo thay đổi với đúng thứ tự tham số
                // sendEmailService(toEmail, emailType, emailDateTime, emailLocation, companyName, emailDuration, employerId)
                emailResult = await sendEmailService(
                    emailData.toEmail, // 1. toEmail
                    email_type, // 2. emailType
                    emailData.emailDateTime, // 3. emailDateTime
                    emailData.emailLocation, // 4. emailLocation
                    emailData.companyName, // 5. companyName
                    emailData.emailDuration, // 6. emailDuration
                    updatedSchedule.employer_id, // 7. employerId
                );
            }

            res.status(200).json({
                success: true,
                message: 'Interview schedule updated successfully',
                data: updatedSchedule,
                email: emailResult
                    ? {
                          sent: emailResult.success || true,
                          type: 'update_notification',
                          recipient: emailResult.recipient,
                          subject: emailResult.subject,
                          messageId: emailResult.messageId,
                      }
                    : {
                          sent: false,
                          reason: 'Email notification disabled',
                      },
            });
        } catch (error) {
            console.error('Error updating interview schedule:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update interview schedule',
            });
        }
    }

    async getInterviewScheduleDetail(req, res) {
        const { scheduleId } = req.params;
        if (!scheduleId) {
            return res.status(400).json({ error: 'Schedule ID is required' });
        }
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select(
                    `
                    *,
                    candidates(full_name, users(email)),
                    jobs(title, position),
                    employers(company_name)
                `,
                )
                .eq('id', scheduleId)
                .single();

            if (error) {
                throw error;
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error getting interview schedule detail:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get interview schedule detail',
            });
        }
    }

    async updateScheduleStatus(req, res) {
        const { status } = req.body;
        const { scheduleId } = req.params;
        if (!scheduleId) {
            return res.status(400).json({ error: 'Schedule ID is required' });
        }
        if (!['scheduled', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', scheduleId)
                .select();
            if (error) {
                throw error;
            }
            if (!data || data.length === 0) {
                return res
                    .status(404)
                    .json({ error: 'Schedule not found or not updated' });
            }
            return res.status(200).json(data[0]);
        } catch (err) {
            console.error('Error updating schedule status:', err);
            return res
                .status(500)
                .json({ error: 'Failed to update schedule status' });
        }
    }

    async getScheduleByStatus(req, res) {
        const { status } = req.body;
        if (!['scheduled', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const { company_id } = req.params;
        if (!company_id) {
            return res.status(400).json({ error: 'Company ID is required' });
        }
        try {
            const { data, error } = await supabase
                .from('interview_schedules')
                .select('*')
                .eq('status', status)
                .eq('employer_id', company_id)
                .order('interview_datetime', { ascending: true });
            if (error) {
                throw error;
            }
            if (!data || data.length === 0) {
                return res
                    .status(404)
                    .json({ error: 'No schedules found for the given status' });
            }
            return res.status(200).json(data);
        } catch (err) {
            console.error('Error getting schedules by status:', err);
            return res
                .status(500)
                .json({ error: 'Failed to get schedules by status' });
        }
    }
}

module.exports = new InterviewScheduleController();
