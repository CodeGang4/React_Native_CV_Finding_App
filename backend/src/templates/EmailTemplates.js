const FormalEmailTemplate = (
    toEmail,
    emailDateTime,
    emailLocation,
    emailDuration,
    companyName = 'TCC & Partners',
) => `
    <div style="max-width:680px;margin:24px auto;background:#ffffff;border-radius:8px;box-shadow:0 6px 18px rgba(12,20,28,0.08);overflow:hidden;border:1px solid #e6e9ee;">

    <div style="padding:20px 24px;background:linear-gradient(90deg,#084c8d,#0b6fb0);color:#fff;">
      <h1 style="margin:0;font-size:18px;font-weight:600;">Lời mời phỏng vấn từ ${companyName}</h1>
    </div>

    <div style="padding:24px;line-height:1.6;font-size:15px;">
      <p>Kính gửi <strong>${toEmail}</strong>,</p>

      <p>Công ty chúng tôi đã xem xét hồ sơ của bạn và rất ấn tượng với kinh nghiệm cũng như kỹ năng của bạn.</p>

      <p>Chúng tôi xin trân trọng mời bạn tham gia buổi phỏng vấn cho vị trí đã ứng tuyển.</p>

      <div style="background:#f7fafc;padding:16px;border-radius:6px;margin:12px 0;border:1px solid #eef2f6;">
        <div style="margin:8px 0;"><strong>Thời gian:</strong> ${emailDateTime || '[Ngày giờ phỏng vấn]'}</div>
        <div style="margin:8px 0;"><strong>Địa điểm:</strong> ${emailLocation || '[Địa chỉ phỏng vấn]'}</div>
        <div style="margin:8px 0;">Thời gian phỏng vấn: ${emailDuration || '[Thời gian phỏng vấn]'}</div>
        <div style="margin:8px 0;"><strong>Người liên hệ:</strong> HR Department</div>
      </div>
      <p style="margin-top:18px;">Trân trọng,<br/><strong>${companyName}</strong></p>
    </div>

    <div style="padding:16px 24px;font-size:13px;color:#56606a;border-top:1px solid #f0f2f5;background:#fafbfc;">
      <p>Nếu bạn có thắc mắc hoặc muốn thay đổi lịch, vui lòng liên hệ với HR Department.</p>
    </div>
  </div>
`;

const friendlyEmailTemplate = (
    toEmail,
    emailDateTime,
    emailLocation,
    emailDuration,
    companyName = 'TCC & Partners',
) => `
    <div style="max-width:680px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e6e9ee;box-shadow:0 6px 18px rgba(12,20,28,0.06);">

    <div style="padding:18px 22px;background:linear-gradient(90deg,#0b6fb0,#084c8d);color:#ffffff;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">Lời mời trao đổi từ ${companyName}</h1>
    </div>

    <div style="padding:20px 22px;line-height:1.6;font-size:15px;color:#0a0a0a;">
      <p style="margin:0 0 12px 0;">Chào <strong>${toEmail}</strong>!</p>

      <p style="margin:0 0 12px 0;">Chúng mình đã xem CV của bạn và thấy rất phù hợp với vị trí team đang tuyển dụng.</p>

      <p style="margin:0 0 12px 0;">Bạn có thể sắp xếp thời gian để chat cùng team về công việc không?</p>

      <div style="background:#f7fafc;padding:14px;border-radius:6px;margin:12px 0;border:1px solid #eef2f6;">
        <div style="margin:6px 0;"><strong>Thời gian:</strong> ${emailDateTime || '[Ngày giờ phỏng vấn]'}</div>
        <div style="margin:6px 0;"><strong>Địa điểm:</strong> ${emailLocation || '[Online/Offline]'}</div>
        <div style="margin:6px 0;"><strong>Thời lượng:</strong> ${emailDuration || '[Thời lượng phỏng vấn]'}</div>
      </div>

      <p style="margin:0 0 12px 0;">Nếu có thắc mắc gì, bạn cứ liên hệ trực tiếp nhé!</p>
      <p style="margin:18px 0 0 0;">Best regards,<br/><strong>${companyName} Team</strong></p>
    </div>

    <div style="padding:14px 22px;font-size:13px;color:#56606a;border-top:1px solid #f0f2f5;background:#fafbfc;">
      <p style="margin:0;">Nếu bạn muốn thay đổi thời gian hoặc cần hỗ trợ, vui lòng trả lời email này hoặc liên hệ với HR Department.</p>
    </div>
  </div>
`;

const onlineEmailTemplate = (
    toEmail,
    emailDateTime,
    emailLocation,
    emailDuration,
    companyName = 'TCC & Partners',
) => `
    <div style="max-width:680px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e6e9ee;box-shadow:0 6px 18px rgba(12,20,28,0.06);">

    <div style="padding:18px 22px;background:linear-gradient(90deg,#0b6fb0,#084c8d);color:#ffffff;">
      <h1 style="margin:0;font-size:18px;font-weight:700;">Lời mời phỏng vấn Online từ ${companyName}</h1>
    </div>

    <div style="padding:20px 22px;line-height:1.6;font-size:15px;color:#0a0a0a;">
      <p style="margin:0 0 12px 0;">Chào <strong>${toEmail}</strong>!</p>

      <p style="margin:0 0 12px 0;">Chúng mình đã xem CV của bạn và thấy rất phù hợp với vị trí team đang tuyển dụng.</p>

      <p style="margin:0 0 12px 0;">Bạn có thể sắp xếp thời gian để tham gia buổi phỏng vấn online không?</p>

      <div style="background:#f7fafc;padding:14px;border-radius:6px;margin:12px 0;border:1px solid #eef2f6;">
        <div style="margin:6px 0;"><strong>Thời gian:</strong> ${emailDateTime || '[Ngày giờ phỏng vấn]'}</div>
        <div style="margin:6px 0;"><strong>Hình thức:</strong> ${emailLocation || 'Online (Google Meet/Zoom)'}</div>
        <div style="margin:6px 0;"><strong>Thời lượng:</strong> ${emailDuration || '[Thời lượng phỏng vấn]'}</div>
      </div>

      <p style="margin:0 0 12px 0;">Link phỏng vấn sẽ được gửi trước buổi phỏng vấn 15 phút.</p>
      <p style="margin:18px 0 0 0;">Best regards,<br/><strong>${companyName} Team</strong></p>
    </div>

    <div style="padding:14px 22px;font-size:13px;color:#56606a;border-top:1px solid #f0f2f5;background:#fafbfc;">
      <p style="margin:0;">Nếu bạn muốn thay đổi thời gian hoặc cần hỗ trợ, vui lòng trả lời email này hoặc liên hệ với HR Department.</p>
    </div>
  </div>
`;

const EmailTemplate = (
    toEmail,
    emailType = 'formal',
    emailDateTime = '',
    emailLocation = '',
    emailDuration = '',
    companyName = 'TCC & Partners',
) => {
    let selectedTemplate = '';

    switch (emailType) {
        case 'formal':
            selectedTemplate = FormalEmailTemplate(
                toEmail,
                emailDateTime,
                emailLocation,
                emailDuration,
                companyName,
            );
            break;
        case 'friendly':
            selectedTemplate = friendlyEmailTemplate(
                toEmail,
                emailDateTime,
                emailLocation,
                emailDuration,
                companyName,
            );
            break;
        case 'online':
            selectedTemplate = onlineEmailTemplate(
                toEmail,
                emailDateTime,
                emailLocation,
                emailDuration,
                companyName,
            );
            break;
        default:
            selectedTemplate = FormalEmailTemplate(
                toEmail,
                emailDateTime,
                emailLocation,
                emailDuration,
                companyName,
            );
            break;
    }

    return selectedTemplate;
};

module.exports = {
    EmailTemplate,
    FormalEmailTemplate,
    friendlyEmailTemplate,
    onlineEmailTemplate,
};
