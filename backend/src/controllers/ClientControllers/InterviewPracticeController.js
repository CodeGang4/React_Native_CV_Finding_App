const supabase = require('../../supabase/config');
const { createClient: createDeepgramClient } = require('@deepgram/sdk');
const redis = require('../../redis/config');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const supabaseStorage = createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
);
const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = process.env.OPEN_AI_KEY;
const axios = require('axios');

const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);

class InterviewPracticeController {
    async uploadAudio(req, res) {
        const userId = req.params.userId;
        const questionId = req.params.questionId;
        if (!questionId) {
            return res.status(400).json({ error: 'Can not find the question' });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = `${userId}/${Date.now()}_${file.originalname}`;
        // Sử dụng supabaseStorage cho cả upload và getPublicUrl
        const { data, error } = await supabaseStorage.storage
            .from('Audio_Buckets')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicData } = supabaseStorage.storage
            .from('Audio_Buckets')
            .getPublicUrl(filePath);
        const publicURL = publicData.publicUrl;

        // Lưu vào database với kiểm tra lỗi - tạo bản ghi mới mỗi lần để cho phép trả lời nhiều lần
        const { data: dbData, error: dbError } = await supabase
            .from('interviews_practices_results')
            .insert({
                candidate_id: userId,
                audio_url: publicURL,
                question_id: questionId,
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Failed to save audio URL' });
        }
        console.log('Audio uploaded and URL saved:', publicURL);

        // Redis log
        try {
            await redis.setEx(
                `log:uploadAudio:${userId}:${Date.now()}`,
                60 * 60 * 24,
                JSON.stringify({
                    action: 'uploadAudio',
                    userId,
                    audio_url: publicURL,
                    time: new Date().toISOString(),
                }),
            );
        } catch (err) {
            console.error('Redis log error (uploadAudio):', err);
        }
        res.status(200).json({ audio_url: publicURL });
    }

    async transcribeAudio(req, res) {
        const userId = req.params.userId;
        const questionId = req.params.questionId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        if (!questionId) {
            return res.status(400).json({ error: 'Question ID is required' });
        }

        // Lấy bản ghi mới nhất của user cho question này (trường hợp trả lời nhiều lần)
        const { data, error } = await supabase
            .from('interviews_practices_results')
            .select('id, audio_url')
            .eq('candidate_id', userId)
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data?.audio_url) {
            return res
                .status(400)
                .json({ error: 'No audio URL found for this user' });
        }

        const audioUrl = data.audio_url;
        console.log('Audio URL:', audioUrl);

        try {
            // tải file audio từ Supabase
            const response = await axios.get(audioUrl, {
                responseType: 'arraybuffer',
            });
            const audioBuffer = Buffer.from(response.data);

            // Đoán mimetype
            const mimetype = audioUrl.endsWith('.mp3')
                ? 'audio/mpeg'
                : 'audio/wav';

            // Gọi Deepgram API v3
            const { result, error: dgError } =
                await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
                    model: 'nova-3',
                    language: 'en',
                    smart_format: true,
                    mimetype,
                });

            if (dgError) {
                console.error('Deepgram API error:', dgError);
                return res
                    .status(500)
                    .json({ error: 'Deepgram transcription failed' });
            }

            const transcript =
                result.results.channels[0].alternatives[0].transcript;

            // Cập nhật transcript cho bản ghi cụ thể
            const { data: updateData, error: updateError } = await supabase
                .from('interviews_practices_results')
                .update({ answer: transcript })
                .eq('id', data.id)
                .select();

            if (updateError) {
                console.error('Supabase update error:', updateError);
                return res
                    .status(500)
                    .json({ error: 'Error saving transcript' });
            }

            return res.status(200).json(updateData[0]);
        } catch (err) {
            console.error('Error in transcribeAudio:', err);
            return res
                .status(500)
                .json({ error: 'Error in transcribing audio' });
        }
    }

    async gradingAnswer(req, res) {
        const userId = req.params.userId;
        const questionId = req.params.questionId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        if (!questionId) {
            return res.status(400).json({ error: 'Question ID is required' });
        }

        // Lấy bản ghi mới nhất của user cho question này (trường hợp trả lời nhiều lần)
        const { data: answerData, error: answerError } = await supabase
            .from('interviews_practices_results')
            .select('id, answer, question_id')
            .eq('candidate_id', userId)
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (answerError || !answerData?.answer) {
            return res
                .status(400)
                .json({ error: 'Không tìm thấy câu trả lời cho user này' });
        }

        // Lấy nội dung câu hỏi từ bảng questions
        const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .select('question')
            .eq('id', answerData.question_id)
            .single();

        if (questionError || !questionData?.question) {
            return res
                .status(400)
                .json({ error: 'Không tìm thấy câu hỏi tương ứng' });
        }

        const prompt = `
        Đây là câu hỏi phỏng vấn: "${questionData.question}".
        Đây là câu trả lời của ứng viên: "${answerData.answer}".
        Bạn là 1 chuyên gia về tuyển dụng, hãy giúp tôi chấm điểm câu trả lời này.

        Hãy chấm điểm câu trả lời này trên thang điểm 1-10 với tiêu chí:
        - 9-10: Xuất sắc, trả lời đầy đủ và chính xác
        - 7-8: Tốt, có hiểu biết cơ bản và trả lời đúng trọng tâm
        - 5-6: Trung bình, thiếu chi tiết hoặc một số sai sót nhỏ
        - 3-4: Yếu, hiểu biết hạn chế hoặc trả lời chưa đúng trọng tâm
        - 1-2: Rất yếu, không liên quan hoặc sai hoàn toàn

        Đưa ra feedback chi tiết, xây dựng và khuyến khích bằng tiếng Việt.
        
        QUAN TRỌNG: Chỉ trả về JSON duy nhất với format:
        {"score": <số từ 1-10>, "feedback": "<feedback đầy đủ trong một chuỗi duy nhất>"}
        
        Không thêm bất kỳ text nào khác ngoài JSON.
    `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        try {
            const result = await model.generateContent(prompt);
            let evaluation;

            try {
                const responseText = result.response.text();
                console.log('Raw Gemini response:', responseText);

                // Tìm JSON trong response - có thể có text khác xung quanh
                let jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON found in response');
                }

                let jsonText = jsonMatch[0];
                // Loại bỏ markdown code blocks nếu có
                jsonText = jsonText.replace(/```json\n?|\n?```/g, '').trim();

                // Xử lý trường hợp feedback bị tách thành nhiều phần
                if (
                    jsonText.includes('"feedback"') &&
                    !jsonText.includes('}')
                ) {
                    // Nếu JSON chưa đóng, lấy toàn bộ text từ feedback đến cuối
                    const feedbackStart = responseText.indexOf('"feedback"');
                    if (feedbackStart !== -1) {
                        const remainingText =
                            responseText.substring(feedbackStart);
                        // Tìm vị trí đóng JSON
                        const endBrace = remainingText.lastIndexOf('}');
                        if (endBrace !== -1) {
                            jsonText =
                                '{' + remainingText.substring(0, endBrace + 1);
                        }
                    }
                }

                evaluation = JSON.parse(jsonText);

                // Validate và điều chỉnh score
                if (evaluation.score > 10) evaluation.score = 10;
                if (evaluation.score < 1) evaluation.score = 1;

                // Đảm bảo feedback tích cực và xây dựng
                if (
                    evaluation.score < 3 &&
                    !evaluation.feedback.includes('khuyến khích')
                ) {
                    evaluation.feedback +=
                        ' Hãy tiếp tục học hỏi và cải thiện!';
                }
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                console.log(
                    'Failed to parse response:',
                    result.response.text(),
                );

                // Fallback: Tạo evaluation từ text response
                const responseText = result.response.text();
                evaluation = {
                    score: 5,
                    feedback:
                        responseText.length > 50
                            ? responseText
                            : 'Cần cải thiện thêm. Hãy tiếp tục học hỏi và cải thiện!',
                };
            }

            // Cập nhật kết quả với validation
            const finalScore = evaluation.score || 5; // Default score nếu null
            const finalFeedback = evaluation.feedback || 'Cần cải thiện thêm.';

            const { data: updateResult, error: updateError } = await supabase
                .from('interviews_practices_results')
                .update({
                    score: finalScore,
                    feedback: finalFeedback,
                })
                .eq('id', answerData.id)
                .select();

            if (updateError) {
                console.error('Supabase update error:', updateError);
                return res
                    .status(500)
                    .json({ error: 'Lưu kết quả chấm điểm thất bại' });
            }

            return res.status(200).json(updateResult);
        } catch (error) {
            if (error.status === 429) {
                return res
                    .status(429)
                    .json({
                        error: 'Quota exceeded. Please check your plan and billing.',
                    });
            }
            console.error('Gemini API error:', error.message || error);
            return res.status(500).json({ error: 'Failed to grade content' });
        }
    }
}

module.exports = new InterviewPracticeController();
