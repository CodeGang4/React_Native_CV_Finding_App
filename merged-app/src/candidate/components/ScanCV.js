import Constants from "expo-constants";
import { useAuth } from "../../shared/contexts/AuthContext";
import CandidateApiService from "../../shared/services/api/CandidateApiService";

const GEMINI_API_KEY = Constants.expoConfig.extra.GEMINI_API_KEY;
const OCR_API_KEY = Constants.expoConfig.extra.OCR_API_KEY;

export default function useCVAnalyzer() {
  const { user } = useAuth();

  const analyzeAndUpdateCV = async () => {
    if (!user?.id) {
      console.error("Không tìm thấy thông tin người dùng.");
      return;
    }

    try {
      console.log("Đang lấy thông tin ứng viên...");
      const candidate = await CandidateApiService.getCandidateById(user.id);
      const cvUrl = candidate?.cv_url;

      if (!cvUrl) {
        console.error("Ứng viên chưa có CV để phân tích.");
        return;
      }

      console.log("CV URL:", cvUrl);

      console.log("Đang gửi yêu cầu OCR đến OCR.space...");
      const cvTextContent = await extractTextFromCVWithOCR(cvUrl);

      if (!cvTextContent || cvTextContent.trim().length < 50) {
        console.error("Không thể đọc nội dung CV hoặc CV quá ngắn");
        console.log("Nội dung nhận được:", cvTextContent);
        return;
      }

      console.log("Đã extract text từ CV thành công, độ dài:", cvTextContent.length);
      console.log("Preview OCR result:", cvTextContent.substring(0, 500) + "...");

      console.log("Đang gửi text đến Gemini để tổng hợp JSON...");
      const aiResult = await analyzeTextWithGemini(cvTextContent);

      if (!aiResult) {
        console.error("Gemini không trả về kết quả hợp lệ");
        return;
      }

      console.log("Gemini phân tích thành công");
      console.log("KẾT QUẢ PHÂN TÍCH (CHƯA CẬP NHẬT):", JSON.stringify(aiResult, null, 2));

      console.log("Phân tích hoàn thành! (Chưa cập nhật database)");
      return aiResult;

    } catch (error) {
      console.error("Lỗi trong quá trình phân tích CV:", error.message);
    }
  };

  return { analyzeAndUpdateCV };
}

async function extractTextFromCVWithOCR(cvUrl) {
  try {
    console.log("Đang gửi URL đến OCR.space...");

    const ocrUrl = `https://api.ocr.space/parse/imageurl?apikey=${OCR_API_KEY}&url=${encodeURIComponent(cvUrl)}&isOverlayRequired=false`;

    console.log("OCR URL:", ocrUrl);

    const response = await fetch(ocrUrl);
    console.log("OCR Response status:", response.status);

    const responseText = await response.text();
    console.log("OCR Response text length:", responseText.length);
    console.log("OCR Text preview:", responseText.substring(0, 300));

    const data = JSON.parse(responseText);

    if (data.IsErroredOnProcessing) {
      console.error("Lỗi OCR:", data.ErrorMessage);
      return null;
    }

    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      console.error("Không có kết quả từ OCR");
      return null;
    }

    const extractedText = data.ParsedResults[0].ParsedText;
    console.log("OCR thành công, độ dài text trích xuất:", extractedText?.length || 0);
    console.log("Extracted text preview:", extractedText.substring(0, 500));

    return extractedText || null;

  } catch (error) {
    console.error("Lỗi khi gọi OCR API:", error);
    return null;
  }
}

async function analyzeTextWithGemini(cvTextContent) {
  try {
    const prompt = `
    Bạn là chuyên gia phân tích CV chuyên nghiệp. 
    Hãy đọc nội dung CV dưới đây và trích xuất thông tin thành JSON đơn giản theo đúng cấu trúc sau:

    {
      "education": "Tên trường học hoặc nơi đào tạo (ví dụ: Phenikaa University)",
      "experience": "Thời gian kinh nghiệm (ví dụ: 1 year, 2 years, fresher, etc.)",
      "skills": ["Danh sách kỹ năng ví dụ: Java", "PHP", "PostgreSQL", "SQL"],
      "job_preferences": ["Vị trí mong muốn ví dụ: PHP Developer", "Java Developer"]
    }

    **NỘI DUNG CV:**
    ${cvTextContent}

    **YÊU CẦU QUAN TRỌNG:**
    - Chỉ trích xuất thông tin có thật trong CV.
    - Nếu không tìm thấy, để giá trị rỗng ("") hoặc mảng rỗng [].
    - Giữ nguyên ngôn ngữ tiếng Việt nếu CV là tiếng Việt.
    - Trả về **chỉ JSON hợp lệ**, không thêm bất kỳ giải thích hoặc văn bản nào khác.

    **Chỉ trả về JSON hợp lệ theo đúng mẫu trên:**
    `;

    console.log("Gửi yêu cầu đến Gemini API...");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Lỗi phản hồi từ Gemini API:", data);
      throw new Error(JSON.stringify(data, null, 2));
    }

    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!aiText) {
      console.error("Gemini không trả dữ liệu hợp lệ.");
      return null;
    }

    console.log("Kết quả thô từ Gemini:", aiText);

    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\u0000-\u001F]+/g, "")
      .trim();

    let aiResult;
    try {
      aiResult = JSON.parse(aiText);
      console.log("Parse JSON từ Gemini thành công");
      return aiResult;
    } catch (err) {
      console.error("Lỗi khi parse JSON từ Gemini:", err.message);
      console.log("Chuỗi JSON lỗi:", aiText);
      return null;
    }

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return null;
  }
}
