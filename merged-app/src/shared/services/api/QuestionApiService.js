import apiClient from "./ApiClient";

export class QuestionApiService {
  static endpoint = "/admin/questions";
  static clientEndpoint = "/client/interview-practice";

  static async getQuestionsByIndustryAndLevel(level, industry) {
    const params = new URLSearchParams({
      level: level,
      industry: industry,
    });

    const response = await apiClient.get(
      `${this.endpoint}/getQuestionsByIndustryAndLevel?${params.toString()}`
    );
    return response.data;
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
        answer: answerText
    };

    const response = await apiClient.post(
        `${this.clientEndpoint}/grade/${candidateId}/${questionId}`,
        body
    );
    
    return Array.isArray(response.data) ? response.data[0] : response.data;
  }

  static async uploadAudio(userId, questionId, audioFile) {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await apiClient.post(
      `${this.clientEndpoint}/uploadAudio/${userId}/${questionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  static async transcribeAudio(userId, questionId) {
    const response = await apiClient.post(
      `${this.clientEndpoint}/transcribeAudio/${userId}/${questionId}`
    );
    
    return Array.isArray(response.data) ? response.data[0] : response.data;
  }


  static async gradeAudioAnswer(userId, questionId) {
    const response = await apiClient.post(
      `${this.clientEndpoint}/grade/${userId}/${questionId}`
    );
    
    return Array.isArray(response.data) ? response.data[0] : response.data;
  }
}