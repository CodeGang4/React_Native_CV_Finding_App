import apiClient from "./ApiClient";

export class QuestionApiService {
  static endpoint = "/admin/questions";
  static clientEndpoint = "/client/interview-practice";

  static async getQuestionsByIndustryAndLevel(level, industry) {
    try {
      const params = new URLSearchParams({
        level: level,
        industry: industry,
      });

      const response = await apiClient.get(
        `${this.endpoint}/getQuestionsByIndustryAndLevel?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      // Nếu là 404, trả về mảng rỗng thay vì throw error
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  static async createQuestion(questionData) {
    const response = await apiClient.post(
      `${this.endpoint}/create`,
      questionData
    );
    return response.data;
  }

  static async generateQuestion(industry, level) {
    const body = {
      industry: industry,
      level: level,
    };

    const response = await apiClient.post(`${this.endpoint}/generate`, body);
    return response.data;
  }

  static async gradeAnswer(candidateId, questionId, answerText) {
    const body = {
      answer: answerText,
    };

    try {
      const response = await apiClient.post(
          `${this.clientEndpoint}/grade/${candidateId}/${questionId}`,
          body
      );
      
      if (!response.data) {
        throw new Error('Server returned empty response for grading');
      }
      
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error('❌ [QuestionApiService] Error grading answer:', error);
      throw error;
    }
  }

  static async uploadAudio(userId, questionId, audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      const response = await apiClient.post(
        `${this.clientEndpoint}/uploadAudio/${userId}/${questionId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (!response.data) {
        console.warn('⚠️ [QuestionApiService] Empty response from uploadAudio');
        return { success: true, message: 'Audio uploaded successfully' };
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [QuestionApiService] Error uploading audio:', error);
      throw error;
    }
  }

  static async transcribeAudio(userId, questionId) {
    try {
      console.log(`🎤 Transcribing audio for user ${userId}, question ${questionId}`);
      
      const response = await apiClient.post(
        `${this.clientEndpoint}/transcribeAudio/${userId}/${questionId}`
      );
      
      if (!response.data) {
        console.warn('⚠️ [QuestionApiService] Empty response from transcription');
        throw new Error('Server returned empty response for transcription');
      }
      
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (!data.answer) {
        console.warn('⚠️ [QuestionApiService] No answer field in transcription response');
        // Return a default answer instead of throwing error
        return {
          ...data,
          answer: "[Không thể nhận diện giọng nói]"
        };
      }
      
      console.log('✅ [QuestionApiService] Transcription successful:', data.answer?.substring(0, 50) + '...');
      return data;
    } catch (error) {
      console.error('❌ [QuestionApiService] Error transcribing audio:', error);
      
      // If it's a network error or server error, return a fallback response
      if (error.response?.status >= 500 || !error.response) {
        return {
          answer: "[Lỗi kết nối - không thể nhận diện giọng nói]",
          id: null
        };
      }
      
      throw error;
    }
  }

  static async gradeAudioAnswer(userId, questionId) {
    const response = await apiClient.post(
      `${this.clientEndpoint}/grade/${userId}/${questionId}`
    );

    return Array.isArray(response.data) ? response.data[0] : response.data;
  }
}