import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Modal,
} from "react-native";
import { useAuth } from "../../../shared/contexts/AuthContext";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/Ionicons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import CandidateApiService from "../../../shared/services/api/CandidateApiService";
import { QuestionApiService } from "../../../shared/services/api/QuestionApiService";

const PRIMARY_COLOR = "#00b14f";
const HEADER_HEIGHT = 56;

export default function InterviewPracticeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("");
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [activeTab, setActiveTab] = useState("bank"); // 'bank' or 'generate'
  const [aiThinking, setAiThinking] = useState(false);
  const [gradingQuestions, setGradingQuestions] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      // ... (Giữ nguyên logic fetchProfile)
      try {
        const resData = await CandidateApiService.getCandidateById(user.id);

        const prefs = resData.job_preferences || [];
        const detectedIndustry =
          Array.isArray(prefs) && prefs.length > 0
            ? prefs[0].trim()
            : "General";

        setIndustry(detectedIndustry);
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err.response?.data || err);
        Alert.alert("Lỗi", "Không thể lấy thông tin hồ sơ người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const fetchQuestionsFromBank = async () => {
    if (!industry || !level) {
      Alert.alert("Thông báo", "Vui lòng chọn cấp độ trước khi lấy câu hỏi.");
      return;
    }

    setAiThinking(true);
    try {
      let fetchedQuestions =
        await QuestionApiService.getQuestionsByIndustryAndLevel(
          level,
          industry
        );

      if (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        Alert.alert(
          "Thành công",
          `Đã tìm thấy ${fetchedQuestions.length} câu hỏi phù hợp!`
        );
      } else {
        Alert.alert(
          "Thông báo",
          "Không có câu hỏi nào trong ngân hàng phù hợp với tiêu chí của bạn."
        );
        setQuestions([]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy câu hỏi:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Lỗi kết nối hoặc API không phản hồi.";
      Alert.alert("Lỗi", `Không thể lấy câu hỏi: ${errorMessage}`);
    } finally {
      setAiThinking(false);
    }
  };

  const generateNewQuestions = async () => {
    if (!industry || !level) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn cấp độ trước khi tạo câu hỏi mới."
      );
      return;
    }

    setAiThinking(true);
    try {
      const generatedQuestions = await QuestionApiService.generateQuestion(
        industry,
        level
      );

      if (Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        Alert.alert("Thành công", "AI đã tạo câu hỏi mới thành công!");
      } else {
        Alert.alert(
          "Thông báo",
          "Không thể tạo câu hỏi mới. Vui lòng thử lại."
        );
      }
    } catch (err) {
      console.error("Lỗi khi tạo câu hỏi:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Lỗi kết nối hoặc API không phản hồi.";
      Alert.alert("Lỗi", `Không thể tạo câu hỏi mới: ${errorMessage}`);
    } finally {
      setAiThinking(false);
    }
  };

  const handleAnswerChange = (id, text) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const gradeSingleQuestion = async (questionId) => {
    const answerText = answers[questionId];

    if (!answerText || answerText.trim() === "") {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập câu trả lời trước khi chấm điểm."
      );
      return;
    }

    setGradingQuestions((prev) => ({ ...prev, [questionId]: true }));

    try {
      const gradeResult = await QuestionApiService.gradeAnswer(
        user.id,
        questionId,
        answerText
      );

      console.log("Kết quả chấm điểm từ API:", gradeResult);

      // Lưu kết quả chấm điểm
      setScores((prev) => ({
        ...prev,
        [questionId]: gradeResult,
      }));

      // Hiển thị kết quả (chú ý: đã thay đổi cú pháp lấy score/feedback để linh hoạt hơn)
      const scoreValue = gradeResult.score || gradeResult.grade || "N/A";
      const feedbackText = gradeResult.feedback || gradeResult.comment || "Không có phản hồi";

      Alert.alert(
        "Kết quả chấm điểm",
        `Điểm số: ${scoreValue}/10\n\nPhản hồi: ${feedbackText}`
      );
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.error || "Lỗi kết nối khi chấm điểm.";
      Alert.alert("Lỗi", `Không thể chấm điểm: ${errorMessage}`);
    } finally {
      setGradingQuestions((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const gradeAllQuestions = async () => {
    const unansweredQuestions = questions.filter(
      (q) => !answers[q.id] || answers[q.id].trim() === ""
    );

    if (unansweredQuestions.length > 0) {
      Alert.alert(
        "Thông báo",
        `Bạn còn ${unansweredQuestions.length} câu hỏi chưa trả lời. Vui lòng trả lời tất cả câu hỏi trước khi chấm điểm.`
      );
      return;
    }

    setAiThinking(true);

    try {
      const gradingResults = {};

      for (const question of questions) {
        const gradeResult = await QuestionApiService.gradeAnswer(
          user.id,
          question.id,
          answers[question.id]
        );
        gradingResults[question.id] = gradeResult;
      }

      setScores(gradingResults);
      Alert.alert(
        "Thành công",
        "Đã chấm điểm tất cả câu hỏi! Hãy kiểm tra kết quả cho từng câu."
      );
    } catch (err) {
      console.error(
        "Lỗi khi chấm điểm tất cả câu hỏi:",
        err.response?.data || err
      );
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chấm điểm. Vui lòng thử lại.");
    } finally {
      setAiThinking(false);
    }
  };

  const handleReset = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn làm lại từ đầu?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: () => {
          setLevel("");
          setQuestions([]);
          setAnswers({});
          setScores({});
          setActiveTab("bank");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={{ marginTop: 10, color: "#555" }}>
          Đang tải thông tin hồ sơ...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="dark-content" />

      {/* FIXED APP BAR / HEADER */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Luyện phỏng vấn cùng AI</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Icon name="reload" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT SCROLLVIEW */}
      <ScrollView
        style={[styles.container, { marginTop: insets.top + HEADER_HEIGHT }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} // Đảm bảo scroll đến cuối
        showsVerticalScrollIndicator={false}
      >
        {/* AI Thinking Modal */}
        <Modal visible={aiThinking} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              <Text style={styles.modalText}>AI đang suy nghĩ...</Text>
              <Text style={styles.modalSubText}>Vui lòng chờ trong giây lát</Text>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Ngành nghề (từ hồ sơ):</Text>
        <Text style={styles.value}>{industry}</Text>

        <Text style={styles.label}>Chọn cấp độ:</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setLevel(value)}
            value={level}
            placeholder={{ label: "Chọn cấp độ", value: null }}
            items={[
              { label: "Intern", value: "intern" },
              { label: "Fresher", value: "fresher" },
              { label: "Junior", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
            ]}
            style={pickerSelectStyles}
          />
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "bank" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("bank")}
          >
            <Icon
              name="library-outline"
              size={20}
              color={activeTab === "bank" ? "#fff" : PRIMARY_COLOR}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "bank" && styles.activeTabText,
              ]}
            >
              Câu hỏi trong ngân hàng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "generate" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("generate")}
          >
            <Icon
              name="sparkles-outline"
              size={20}
              color={activeTab === "generate" ? "#fff" : PRIMARY_COLOR}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "generate" && styles.activeTabText,
              ]}
            >
              Tạo câu hỏi mới
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button based on Active Tab */}
        <TouchableOpacity
          style={[styles.button, (!level || aiThinking) && styles.disabledButton]}
          onPress={
            activeTab === "bank" ? fetchQuestionsFromBank : generateNewQuestions
          }
          disabled={!level || aiThinking}
        >
          {aiThinking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon
              name={activeTab === "bank" ? "search-outline" : "sparkles-outline"}
              size={20}
              color="#fff"
            />
          )}
          <Text style={styles.buttonText}>
            {aiThinking
              ? "AI đang xử lý..."
              : activeTab === "bank"
              ? "Lấy câu hỏi từ ngân hàng"
              : "AI tạo câu hỏi mới"}
          </Text>
        </TouchableOpacity>

        {questions.length === 0 && !aiThinking && (
          <View style={styles.emptyState}>
            <Icon name="chatbubbles-outline" size={50} color={PRIMARY_COLOR} />
            <Text style={styles.emptyText}>
              {activeTab === "bank"
                ? "Chọn cấp độ và lấy câu hỏi từ ngân hàng để bắt đầu!"
                : "Chọn cấp độ và để AI tạo câu hỏi phỏng vấn mới cho bạn!"}
            </Text>
          </View>
        )}

        {questions.length > 0 && (
          <View style={styles.questionsContainer}>
            <Text style={styles.subHeader}>
              {questions.length} câu hỏi{" "}
              {activeTab === "bank" ? "từ ngân hàng" : "được AI tạo"}
            </Text>

            {questions.map((q, idx) => (
              <View key={q.id || idx} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.aiRow}>
                    <Icon
                      name="help-circle-outline"
                      size={22}
                      color={PRIMARY_COLOR}
                    />
                    <Text style={styles.questionText}>
                      {idx + 1}. {q.question_text || q.question}
                    </Text>
                  </View>

                  {/* Score Display */}
                  {scores[q.id] && (
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>
                        Điểm: {scores[q.id].score || "N/A"}
                      </Text>
                    </View>
                  )}
                </View>

                <TextInput
                  placeholder="Nhập câu trả lời của bạn..."
                  placeholderTextColor="#999"
                  value={answers[q.id] || ""}
                  onChangeText={(text) => handleAnswerChange(q.id, text)}
                  style={styles.answerInput}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={[
                    styles.gradeButton,
                    (!answers[q.id] || answers[q.id].trim() === "") &&
                      styles.disabledGradeButton,
                  ]}
                  onPress={() => gradeSingleQuestion(q.id)}
                  disabled={
                    !answers[q.id] ||
                    answers[q.id].trim() === "" ||
                    gradingQuestions[q.id]
                  }
                >
                  {gradingQuestions[q.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Icon name="school-outline" size={16} color="#fff" />
                  )}
                  <Text style={styles.gradeButtonText}>
                    {gradingQuestions[q.id] ? "Đang chấm..." : "Chấm điểm"}
                  </Text>
                </TouchableOpacity>

                {scores[q.id]?.feedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackTitle}>Phản hồi từ AI:</Text>
                    <Text style={styles.feedbackText}>
                      {scores[q.id].feedback}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={gradeAllQuestions}
            >
              <Icon name="trophy-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>Chấm điểm tất cả</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  // --- APP BAR STYLES ---
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    zIndex: 10,
    paddingHorizontal: 20,
    // Chiều cao cố định của nội dung header (không tính safe area top)
    height: HEADER_HEIGHT, 
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: '100%', // Chiếm toàn bộ chiều cao của appBar
  },
  header: {
    fontSize: 18, // Thu nhỏ font cho phù hợp với app bar
    fontWeight: "700",
    color: "#fff", // Đổi màu chữ thành trắng
  },
  resetButton: {
    padding: 5, // Tăng padding để dễ chạm hơn
  },
  // --- MAIN CONTENT STYLES ---
  container: {
    flex: 1,
    paddingHorizontal: 20,
    // marginTop đã được tính bằng insets.top + HEADER_HEIGHT ở trên
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // ... (Giữ nguyên các styles còn lại)
  label: { fontSize: 14, color: "#666", marginTop: 10 },
  value: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  activeTabButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
  activeTabText: {
    color: "#fff",
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
  },
  disabledButton: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
  questionsContainer: { marginTop: 20 },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginVertical: 10,
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  scoreText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  answerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    minHeight: 100,
    fontSize: 15,
    marginBottom: 10,
  },
  gradeButton: {
    backgroundColor: "#ff6b35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  disabledGradeButton: {
    backgroundColor: "#ccc",
  },
  gradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  feedbackContainer: {
    backgroundColor: "#f0f7ff",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 15,
    borderRadius: 12,
    marginVertical: 20,
  },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
  },
  modalSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, color: "#333", padding: 10 },
  inputAndroid: { fontSize: 16, color: "#333", padding: 10 },
});