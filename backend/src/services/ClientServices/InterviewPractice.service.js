const InterviewPracticeRepository = require("../../repositories/ClientRepositories/InterviewPractice.repository");
const InterviewPracticeCache = require("../../Cache/ClientCache/InterviewPractice.cache");
const { AppError } = require("../../utils/errorHandler");
const { createClient: createDeepgramClient } = require("@deepgram/sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.OPEN_AI_KEY);


class InterviewPracticeService {
    /**
     * Upload audio file and create interview result
     * @param {string} userId
     * @param {string} questionId
     * @param {Object} file - File object from multer
     * @returns {Promise<Object>}
     */
    async uploadAudio(userId, questionId, file) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            if (!questionId) {
                throw new AppError("Question ID is required", 400);
            }

            if (!file || !file.buffer) {
                throw new AppError("No file uploaded", 400);
            }

            // Validate audio file type
            // const allowedMimeTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg"];
            // if (!allowedMimeTypes.includes(file.mimetype)) {
            //     throw new AppError("Invalid file type. Only audio files are allowed", 400);
            // }

            // Validate file size (max 50MB for audio)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.buffer.length > maxSize) {
                throw new AppError("File size exceeds 50MB limit", 400);
            }

            console.log(`Starting audio upload for user: ${userId}, question: ${questionId}`);

            // 1. Upload file to storage
            const { data: uploadData, error: uploadError } =
                await InterviewPracticeRepository.uploadAudioFile(
                    userId,
                    file.buffer,
                    file.originalname,
                    file.mimetype
                );

            if (uploadError || !uploadData) {
                console.error("File upload error:", uploadError);
                throw new AppError("Failed to upload audio file", 500);
            }

            console.log(`Audio file uploaded successfully: ${uploadData.path}`);

            // 2. Get public URL
            const publicURL = InterviewPracticeRepository.getPublicAudioUrl(uploadData.path);
            console.log(`Public URL generated: ${publicURL}`);

            // 3. Create interview result in database
            const { data: resultData, error: resultError } =
                await InterviewPracticeRepository.createInterviewResult(
                    userId,
                    questionId,
                    publicURL
                );

            if (resultError || !resultData) {
                console.error("Database insert error:", resultError);
                throw new AppError("Failed to save audio URL", 500);
            }

            console.log(`Interview result created: ${resultData.id}`);

            // 4. Cache the result
            await InterviewPracticeCache.setResultCache(resultData.id, resultData);
            await InterviewPracticeCache.setLatestResultCache(userId, questionId, resultData);

            // 5. Invalidate user results cache
            await InterviewPracticeCache.invalidateUserResultsCache(userId);

            // 6. Log action
            await InterviewPracticeCache.logAction("uploadAudio", userId, {
                audio_url: publicURL,
                question_id: questionId,
            });

            console.log("Audio uploaded and cached successfully");

            return { audio_url: publicURL };
        } catch (error) {
            console.error("InterviewPracticeService.uploadAudio error:", error);
            throw error;
        }
    }

    /**
     * Transcribe audio using Deepgram API
     * @param {string} userId
     * @param {string} questionId
     * @returns {Promise<Object>}
     */
    async transcribeAudio(userId, questionId) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            if (!questionId) {
                throw new AppError("Question ID is required", 400);
            }

            console.log(`Starting transcription for user: ${userId}, question: ${questionId}`);

            // 1. Try to get from cache first
            let resultData = await InterviewPracticeCache.getLatestResultCache(userId, questionId);

            // 2. If not in cache, get from database
            if (!resultData) {
                const { data, error } = await InterviewPracticeRepository.getLatestResult(
                    userId,
                    questionId
                );

                if (error || !data?.audio_url) {
                    throw new AppError("No audio URL found for this user and question", 400);
                }

                resultData = data;
                
                // Cache it for future use
                await InterviewPracticeCache.setLatestResultCache(userId, questionId, resultData);
            }

            const audioUrl = resultData.audio_url;
            console.log("Audio URL:", audioUrl);

            // 3. Download audio file
            const response = await axios.get(audioUrl, {
                responseType: "arraybuffer",
            });
            const audioBuffer = Buffer.from(response.data);

            // 4. Determine mimetype
            const mimetype = audioUrl.endsWith(".mp3") ? "audio/mpeg" : "audio/wav";

            // 5. Try transcription with Vietnamese first
            let transcribeOptions = {
                model: "nova-2",
                language: "vi",
                smart_format: true,
                mimetype,
            };

            let { result, error: dgError } = await deepgram.listen.prerecorded.transcribeFile(
                audioBuffer,
                transcribeOptions
            );

            // 6. If failed, retry with fallback configuration
            if (dgError) {
                console.log("Retrying with fallback configuration...");
                transcribeOptions = {
                    model: "base",
                    language: "vi",
                    smart_format: true,
                    mimetype,
                };

                const fallbackResult = await deepgram.listen.prerecorded.transcribeFile(
                    audioBuffer,
                    transcribeOptions
                );
                result = fallbackResult.result;
                dgError = fallbackResult.error;
            }

            if (dgError) {
                console.error("Deepgram API error:", dgError);
                throw new AppError("Deepgram transcription failed", 500);
            }

            // 7. Extract transcript
            const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

            let finalTranscript = transcript;
            let warning = null;

            // 8. Handle empty transcript
            if (!transcript || transcript.trim().length === 0) {
                console.warn("Empty transcript received from Deepgram");
                finalTranscript = "[Không thể nhận diện giọng nói]";
                warning = "Could not transcribe audio - no speech detected";
            }

            console.log("Transcript received:", finalTranscript);

            // 9. Update database with transcript
            const { data: updateData, error: updateError } =
                await InterviewPracticeRepository.updateTranscript(resultData.id, finalTranscript);

            if (updateError || !updateData) {
                console.error("Supabase update error:", updateError);
                throw new AppError("Error saving transcript", 500);
            }

            console.log("Transcript saved to database");

            // 10. Update cache
            const updatedResult = updateData[0];
            await InterviewPracticeCache.setResultCache(resultData.id, updatedResult);
            await InterviewPracticeCache.setLatestResultCache(userId, questionId, updatedResult);

            // 11. Invalidate user results cache
            await InterviewPracticeCache.invalidateUserResultsCache(userId);

            const response_data = { ...updatedResult };
            if (warning) {
                response_data.warning = warning;
            }

            return response_data;
        } catch (error) {
            console.error("InterviewPracticeService.transcribeAudio error:", error);
            throw error;
        }
    }

    /**
     * Grade answer using Gemini AI
     * @param {string} userId
     * @param {string} questionId
     * @returns {Promise<Object>}
     */
    async gradingAnswer(userId, questionId) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            if (!questionId) {
                throw new AppError("Question ID is required", 400);
            }

            console.log(`Starting grading for user: ${userId}, question: ${questionId}`);

            // 1. Get latest result (from cache or database)
            let answerData = await InterviewPracticeCache.getLatestResultCache(userId, questionId);

            if (!answerData) {
                const { data, error } = await InterviewPracticeRepository.getLatestResult(
                    userId,
                    questionId
                );

                if (error || !data?.answer) {
                    throw new AppError("Không tìm thấy câu trả lời cho user này", 400);
                }

                answerData = data;
                
                // Cache it
                await InterviewPracticeCache.setLatestResultCache(userId, questionId, answerData);
            }

            if (!answerData.answer) {
                throw new AppError("Không có câu trả lời để chấm điểm", 400);
            }

            // 2. Get question (from cache or database)
            let questionData = await InterviewPracticeCache.getQuestionCache(answerData.question_id || questionId);

            if (!questionData) {
                const { data, error } = await InterviewPracticeRepository.getQuestionById(
                    answerData.question_id || questionId
                );

                if (error || !data?.question) {
                    throw new AppError("Không tìm thấy câu hỏi tương ứng", 400);
                }

                questionData = data;
                
                // Cache the question
                await InterviewPracticeCache.setQuestionCache(questionData.id, questionData);
            }

            // 3. Build prompt for AI
            const prompt = `
Đây là câu hỏi phỏng vấn: "${questionData.question}".
Đây là câu trả lời của ứng viên: "${answerData.answer}".

Bạn là chuyên gia tuyển dụng, hãy chấm điểm câu trả lời này theo thang điểm 1-10:
- 9-10: Xuất sắc, trả lời đầy đủ và chính xác
- 7-8: Tốt, có hiểu biết cơ bản và trả lời đúng trọng tâm  
- 5-6: Trung bình, thiếu chi tiết hoặc một số sai sót nhỏ
- 3-4: Yếu, hiểu biết hạn chế hoặc trả lời chưa đúng trọng tâm
- 1-2: Rất yếu, không liên quan hoặc sai hoàn toàn

Trả về CHÍNH XÁC định dạng JSON sau và KHÔNG có text gì khác:
{"score": <số từ 1-10>, "feedback": "<feedback chi tiết bằng tiếng Việt trong một chuỗi duy nhất>"}
`;

            // 4. Call Gemini AI
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let evaluation;
            let result;
            try {
                result = await model.generateContent(prompt);
                const responseText = result.response.text();
                console.log("Raw Gemini response:", responseText);

                // 5. Parse AI response
                let cleanText = responseText.replace(/```json\n?|\n?```/g, "").trim();

                const firstBrace = cleanText.indexOf("{");
                const lastBrace = cleanText.lastIndexOf("}");

                if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
                    throw new Error("No valid JSON structure found");
                }

                const jsonText = cleanText.substring(firstBrace, lastBrace + 1);
                console.log("Extracted JSON:", jsonText);

                evaluation = JSON.parse(jsonText);

                // 6. Validate and normalize score
                if (!evaluation.score || evaluation.score > 10) evaluation.score = 10;
                if (evaluation.score < 1) evaluation.score = 1;

                if (!evaluation.feedback) {
                    evaluation.feedback = "Cảm ơn bạn đã trả lời. Hãy tiếp tục cải thiện!";
                }

                console.log("Parsed evaluation:", {
                    score: evaluation.score,
                    feedbackLength: evaluation.feedback.length,
                });
            } catch (parseError) {
                console.error("JSON parsing error:", parseError);

                // 7. Fallback parsing if JSON parse fails
                const responseText = result ? result.response.text() : "";
                const scoreMatch = responseText.match(/score["\s:]*(\d+)/i);
                const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;

                evaluation = {
                    score: Math.min(Math.max(extractedScore, 1), 10),
                    feedback:
                        responseText.length > 50
                            ? responseText.replace(/```json|```/g, "").trim()
                            : "Cần cải thiện thêm. Hãy tiếp tục học hỏi và cải thiện!",
                };
            }

            const finalScore = evaluation.score || 5;
            const finalFeedback = evaluation.feedback || "Cần cải thiện thêm.";

            // 8. Update database with score and feedback
            const { data: updateResult, error: updateError } =
                await InterviewPracticeRepository.updateScoreAndFeedback(
                    answerData.id,
                    finalScore,
                    finalFeedback
                );

            if (updateError || !updateResult) {
                console.error("Supabase update error:", updateError);
                throw new AppError("Lưu kết quả chấm điểm thất bại", 500);
            }

            console.log("Score and feedback saved to database");

            // 9. Update cache
            const updatedResult = updateResult[0];
            await InterviewPracticeCache.setResultCache(answerData.id, updatedResult);
            await InterviewPracticeCache.setLatestResultCache(userId, questionId, updatedResult);

            // 10. Invalidate user results cache
            await InterviewPracticeCache.invalidateUserResultsCache(userId);

            return updatedResult;
        } catch (error) {
            if (error.status === 429) {
                throw new AppError("Quota exceeded. Please check your plan and billing.", 429);
            }
            console.error("InterviewPracticeService.gradingAnswer error:", error);
            throw error;
        }
    }

    /**
     * Get all results for a user
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getUserResults(userId) {
        try {
            if (!userId) {
                throw new AppError("User ID is required", 400);
            }

            // 1. Try cache first
            let results = await InterviewPracticeCache.getUserResultsCache(userId);

            if (results) {
                console.log(`User results retrieved from cache: ${userId}`);
                return results;
            }

            // 2. Cache miss: Get from database
            const { data, error } = await InterviewPracticeRepository.getUserResults(userId);

            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch user results", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // 3. Cache the results
            await InterviewPracticeCache.setUserResultsCache(userId, data);
            console.log(`Cached ${data.length} results for user: ${userId}`);

            return data;
        } catch (error) {
            console.error("InterviewPracticeService.getUserResults error:", error);
            throw error;
        }
    }
}

module.exports = new InterviewPracticeService();
