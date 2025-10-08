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
} from "react-native";
import axios from "axios";
import { useAuth } from "../../shared/contexts/AuthContext";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/Ionicons";

const PRIMARY_COLOR = "#00b14f";
const API_BASE = "http://192.168.1.3:3000";

export default function InterviewPracticeScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("");
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/client/candidates/getProfile/${user.id}`
        );
        const prefs = res.data.job_preferences || [];
        const detectedIndustry =
          Array.isArray(prefs) && prefs.length > 0
            ? prefs[0].trim()
            : "General";
        setIndustry(detectedIndustry);
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err);
        Alert.alert("Lỗi", "Không thể lấy thông tin hồ sơ người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const fetchQuestions = async () => {
    if (!industry || !level) {
      Alert.alert("Thông báo", "Vui lòng chọn cấp độ trước khi luyện phỏng vấn.");
      return;
    }

    setFetchingQuestions(true);
    try {
      const res = await axios.get(
        `${API_BASE}/admin/questions/getQuestionsByIndustryAndLevel`,
        { params: { industry, level } }
      );
      const fetchedQuestions = res.data;

      if (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        const newQuestionData = {
          industry,
          level,
          question_text: `Giới thiệu về bản thân bạn (ngành ${industry}, cấp độ ${level})`,
          answer_example: "Tôi là lập trình viên đam mê công nghệ...",
        };
        const createRes = await axios.post(
          `${API_BASE}/admin/questions/create`,
          newQuestionData
        );
        setQuestions([createRes.data]);
        Alert.alert("Thông báo", "Không có câu hỏi phù hợp — đã tạo câu hỏi mẫu mới!");
      }
    } catch (err) {
      console.error("Lỗi khi lấy câu hỏi:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Lỗi kết nối hoặc API không phản hồi.";
      Alert.alert("Lỗi", `Không thể lấy hoặc tạo câu hỏi: ${errorMessage}`);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const handleAnswerChange = (id, text) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleSubmit = () => {
    console.log("Các câu trả lời:", answers);
    Alert.alert("Nộp bài", "Câu trả lời của bạn đang được AI đánh giá!");
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerRow}>
        <Text style={styles.header}>Luyện phỏng vấn cùng AI</Text>
        <TouchableOpacity onPress={handleReset}>
          <Icon name="reload" size={30} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

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

      <TouchableOpacity
        style={[styles.button, fetchingQuestions && styles.disabledButton]}
        onPress={fetchQuestions}
        disabled={fetchingQuestions}
      >
        <Icon name="chatbubbles-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {fetchingQuestions ? "AI đang tạo câu hỏi..." : "Bắt đầu luyện phỏng vấn"}
        </Text>
      </TouchableOpacity>

      {questions.length === 0 && !fetchingQuestions && (
        <View style={styles.emptyState}>
          <Icon name="sparkles-outline" size={50} color={PRIMARY_COLOR} />
          <Text style={styles.emptyText}>
            Chọn cấp độ và để AI tạo câu hỏi phỏng vấn cho bạn!
          </Text>
        </View>
      )}

      {questions.length > 0 && (
        <View style={styles.questionsContainer}>
          <Text style={styles.subHeader}>Câu hỏi từ AI</Text>
          {questions.map((q, idx) => (
            <View key={q.id || idx} style={styles.questionCard}>
              <View style={styles.aiRow}>
                <Icon name="logo-react" size={22} color={PRIMARY_COLOR} />
                <Text style={styles.questionText}>
                  {idx + 1}. {q.question_text || q.question}
                </Text>
              </View>

              {q.answer_example && (
                <Text style={styles.hintText}>
                  💡 Gợi ý: {q.answer_example}
                </Text>
              )}

              <TextInput
                placeholder="Nhập câu trả lời của bạn..."
                placeholderTextColor="#999"
                value={answers[q.id] || ""}
                onChangeText={(text) => handleAnswerChange(q.id, text)}
                style={styles.answerInput}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Icon name="send-outline" size={20} color="#fff" />
            <Text style={styles.submitText}>Nộp bài</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },
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
  aiRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  questionText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    flex: 1,
  },
  hintText: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    marginBottom: 8,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    minHeight: 70,
    fontSize: 15,
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
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, color: "#333", padding: 10 },
  inputAndroid: { fontSize: 16, color: "#333", padding: 10 },
});
