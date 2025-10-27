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

<<<<<<< HEAD
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
=======
    const response = await apiClient.post(
      `${this.clientEndpoint}/grade/${candidateId}/${questionId}`,
      body
    );

    return Array.isArray(response.data) ? response.data[0] : response.data;
>>>>>>> 1f98fd0fec4529fb3c7c7163c6e6141397e8e4cd
  }

  static async uploadAudio(userId, questionId, audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

<<<<<<< HEAD
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
=======
    const response = await apiClient.post(
      `${this.clientEndpoint}/uploadAudio/${userId}/${questionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
>>>>>>> 1f98fd0fec4529fb3c7c7163c6e6141397e8e4cd
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [QuestionApiService] Error uploading audio:', error);
      throw error;
    }
  }

  static async transcribeAudio(userId, questionId) {
<<<<<<< HEAD
    try {
      const response = await apiClient.post(
        `${this.clientEndpoint}/transcribeAudio/${userId}/${questionId}`
      );
      
      if (!response.data) {
        throw new Error('Server returned empty response for transcription');
      }
      
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      
      if (!data.answer) {
        throw new Error('Transcription response missing answer field');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [QuestionApiService] Error transcribing audio:', error);
      throw error;
    }
=======
    const response = await apiClient.post(
      `${this.clientEndpoint}/transcribeAudio/${userId}/${questionId}`
    );

    return Array.isArray(response.data) ? response.data[0] : response.data;
>>>>>>> 1f98fd0fec4529fb3c7c7163c6e6141397e8e4cd
  }

  static async gradeAudioAnswer(userId, questionId) {
    const response = await apiClient.post(
      `${this.clientEndpoint}/grade/${userId}/${questionId}`
    );

    return Array.isArray(response.data) ? response.data[0] : response.data;
  }
}