const supabase = require("../../supabase/config");
const { createClient } = require("@supabase/supabase-js");

// Create storage client with service key for admin operations
const supabaseStorage = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Repository Layer - Database operations for Interview Practice
 * Responsibility: Data access and persistence
 */
class InterviewPracticeRepository {
    /**
     * Upload audio file to Supabase Storage
     * @param {string} userId - User ID
     * @param {Buffer} fileBuffer - File buffer from multer
     * @param {string} originalName - Original file name
     * @param {string} mimeType - File MIME type
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async uploadAudioFile(userId, fileBuffer, originalName, mimeType) {
        try {
            const filePath = `${userId}/${Date.now()}_${originalName}`;
            const { data, error } = await supabaseStorage.storage
                .from("Audio_Buckets")
                .upload(filePath, fileBuffer, {
                    contentType: mimeType,
                    upsert: true,
                });

            if (error) {
                return { data: null, error };
            }

            return { data: { path: filePath }, error: null };
        } catch (error) {
            console.error("InterviewPracticeRepository.uploadAudioFile error:", error);
            return { data: null, error };
        }
    }

    /**
     * Get public URL for uploaded audio
     * @param {string} filePath - File path in storage
     * @returns {string} Public URL
     */
    getPublicAudioUrl(filePath) {
        const { data } = supabaseStorage.storage
            .from("Audio_Buckets")
            .getPublicUrl(filePath);
        return data.publicUrl;
    }

    /**
     * Create interview practice result
     * @param {string} candidateId
     * @param {string} questionId
     * @param {string} audioUrl
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async createInterviewResult(candidateId, questionId, audioUrl) {
        try {
            const { data, error } = await supabase
                .from("interviews_practices_results")
                .insert({
                    candidate_id: candidateId,
                    question_id: questionId,
                    audio_url: audioUrl,
                })
                .select()
                .single();
            return { data, error };
        } catch (error) {
            console.error("InterviewPracticeRepository.createInterviewResult error:", error);
            return { data: null, error };
        }
    }

    /**
     * Get latest interview result by user and question
     * @param {string} userId
     * @param {string} questionId
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async getLatestResult(userId, questionId) {
        try {
            const { data, error } = await supabase
                .from("interviews_practices_results")
                .select("id, audio_url, answer, score, feedback, created_at")
                .eq("candidate_id", userId)
                .eq("question_id", questionId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            return { data, error };
        } catch (error) {
            console.error("InterviewPracticeRepository.getLatestResult error:", error);
            return { data: null, error };
        }
    }

    /**
     * Update interview result with transcript
     * @param {string} resultId
     * @param {string} transcript
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async updateTranscript(resultId, transcript) {
        try {
            const { data, error } = await supabase
                .from("interviews_practices_results")
                .update({ answer: transcript })
                .eq("id", resultId)
                .select();
            return { data, error };
        } catch (error) {
            console.error("InterviewPracticeRepository.updateTranscript error:", error);
            return { data: null, error };
        }
    }

    /**
     * Update interview result with score and feedback
     * @param {string} resultId
     * @param {number} score
     * @param {string} feedback
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async updateScoreAndFeedback(resultId, score, feedback) {
        try {
            const { data, error } = await supabase
                .from("interviews_practices_results")
                .update({
                    score: score,
                    feedback: feedback,
                })
                .eq("id", resultId)
                .select();
            return { data, error };
        } catch (error) {
            console.error("InterviewPracticeRepository.updateScoreAndFeedback error:", error);
            return { data: null, error };
        }
    }

    /**
     * Get question by ID
     * @param {string} questionId
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async getQuestionById(questionId) {
        try {
            const { data, error } = await supabase
                .from("questions")
                .select("id, question, industry, level")
                .eq("id", questionId)
                .single();
            return { data, error };
        } catch (error) {
            console.error("InterviewPracticeRepository.getQuestionById error:", error);
            return { data: null, error };
        }
    }

    /**
     * Get all interview results for a user
     * @param {string} userId
     * @returns {Promise<{data: Array|null, error: Object|null}>}
     */
    async getUserResults(userId) {
        try {
            const { data, error } = await supabase
                .from("interviews_practices_results")
                .select("*, questions(question, industry, level)")
                .eq("candidate_id", userId)
                .order("created_at", { ascending: false });
            return { data, error };
        } catch (error) {
            console.error("InterviewPracticeRepository.getUserResults error:", error);
            return { data: null, error };
        }
    }
}

module.exports = new InterviewPracticeRepository();
    