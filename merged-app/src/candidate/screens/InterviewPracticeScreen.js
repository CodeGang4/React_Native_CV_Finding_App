import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Image,
} from "react-native";
import { useAuth } from "../../shared/contexts/AuthContext";
import RNPickerSelect from "react-native-picker-select";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { Audio } from "expo-av";

import CandidateApiService from "../../shared/services/api/CandidateApiService";
import { QuestionApiService } from "../../shared/services/api/QuestionApiService";

const PRIMARY_COLOR = "#00b14f";

export default function InterviewPracticeScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [industry, setIndustry] = useState("");
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [activeTab, setActiveTab] = useState("bank");
  const [aiThinking, setAiThinking] = useState(false);
  const [gradingQuestions, setGradingQuestions] = useState({});

  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingQuestion, setCurrentRecordingQuestion] =
    useState(null);
  const [playingRecordings, setPlayingRecordings] = useState({});

  const soundRefs = useRef({});

  const fetchProfile = async () => {
    try {
      console.log("Đang tải thông tin profile...");
      const resData = await CandidateApiService.getCandidateById(user.id);

      const prefs = resData.job_preferences || [];
      const detectedIndustry =
        Array.isArray(prefs) && prefs.length > 0 ? prefs[0].trim() : "General";

      console.log("Ngành nghề mới:", detectedIndustry);
      setIndustry(detectedIndustry);
    } catch (err) {
      console.error("Lỗi khi lấy profile:", err.response?.data || err);
      Alert.alert("Lỗi", "Không thể lấy thông tin hồ sơ người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Trang Interview Practice được focus - loading lại profile");
      fetchProfile();
    });

    return () => {
      unsubscribe();
      Object.values(soundRefs.current).forEach((sound) => {
        if (sound) {
          sound.unloadAsync();
        }
      });
    };
  }, [user, navigation]);

  useEffect(() => {
    if (isFocused) {
      console.log("🔍 isFocused changed - loading profile");
      fetchProfile();
    }
  }, [isFocused]);

  async function startRecording(questionId) {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setCurrentRecordingQuestion(questionId);
      console.log("Recording started for question:", questionId);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm. Vui lòng thử lại.");
    }
  }

  async function stopRecording() {
    if (!recording) return;

    console.log("Stopping recording..");
    setRecording(undefined);
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      if (currentRecordingQuestion) {
        setRecordings((prev) => ({
          ...prev,
          [currentRecordingQuestion]: uri,
        }));

        setAnswers((prev) => ({
          ...prev,
          [currentRecordingQuestion]: "",
        }));

        if (playingRecordings[currentRecordingQuestion]) {
          await stopPlayingRecording(currentRecordingQuestion);
        }
      }

      setCurrentRecordingQuestion(null);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Lỗi", "Không thể dừng ghi âm.");
    }
  }

  const deleteRecording = (questionId) => {
    Alert.alert("Xóa bản ghi âm", "Bạn có chắc muốn xóa bản ghi âm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setRecordings((prev) => {
            const newRecordings = { ...prev };
            delete newRecordings[questionId];
            return newRecordings;
          });
          setAnswers((prev) => ({
            ...prev,
            [questionId]: "",
          }));
          if (playingRecordings[questionId]) {
            stopPlayingRecording(questionId);
          }
        },
      },
    ]);
  };

  const playRecording = async (questionId) => {
    const audioUri = recordings[questionId];
    if (!audioUri) return;

    try {
      if (playingRecordings[questionId]) {
        await stopPlayingRecording(questionId);
        return;
      }

      for (const [qId, isPlaying] of Object.entries(playingRecordings)) {
        if (isPlaying && qId !== questionId) {
          await stopPlayingRecording(qId);
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      soundRefs.current[questionId] = sound;

      setPlayingRecordings((prev) => ({
        ...prev,
        [questionId]: true,
      }));

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          stopPlayingRecording(questionId);
        }
      });

      await sound.playAsync();
    } catch (err) {
      console.error("Failed to play recording", err);
      Alert.alert("Lỗi", "Không thể phát bản ghi âm.");
    }
  };

  const stopPlayingRecording = async (questionId) => {
    try {
      const sound = soundRefs.current[questionId];
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        delete soundRefs.current[questionId];
      }

      setPlayingRecordings((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const uploadAndTranscribeAudio = async (questionId) => {
    const audioUri = recordings[questionId];

    if (!audioUri) {
      throw new Error("Không có bản ghi âm nào để chuyển đổi.");
    }

    try {
      const audioFile = {
        uri: audioUri,
        type: "audio/m4a",
        name: `recording_${questionId}_${Date.now()}.m4a`,
      };

      await QuestionApiService.uploadAudio(user.id, questionId, audioFile);

      const transcribeResult = await QuestionApiService.transcribeAudio(
        user.id,
        questionId
      );

      if (transcribeResult.answer) {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: transcribeResult.answer,
        }));
        return transcribeResult.answer;
      } else {
        throw new Error("Không thể chuyển đổi âm thanh thành văn bản.");
      }
    } catch (err) {
      console.error("Lỗi khi chuyển đổi âm thanh:", err.response?.data || err);
      throw err;
    }
  };

  const fetchQuestionsFromBank = async () => {
  if (!industry || !level) {
    Alert.alert("Thông báo", "Vui lòng chọn cấp độ trước khi lấy câu hỏi.");
    return;
  }

  setAiThinking(true);
  try {
    console.log("Bắt đầu fetch questions...");
    
    let fetchedQuestions = await QuestionApiService.getQuestionsByIndustryAndLevel(
      level,
      industry
    );

    console.log("Fetch questions thành công:", fetchedQuestions);

    if (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0) {
      setQuestions(fetchedQuestions);
      console.log(`Đã tải ${fetchedQuestions.length} câu hỏi`);
    } else {
      console.log("Không có câu hỏi phù hợp");
      Alert.alert(
        "Thông báo",
        "Không có câu hỏi nào phù hợp với bạn. Vui lòng tạo câu hỏi mới sử dụng AI."
      );
      setQuestions([]);
      setActiveTab("generate");
    }
  } catch (err) {
    if (err.data && Array.isArray(err.data) && err.data.length === 0) {
      console.log("Không có câu hỏi phù hợp (từ catch block)");
      Alert.alert(
        "Thông báo", 
        "Không có câu hỏi nào phù hợp với bạn. Vui lòng tạo câu hỏi mới sử dụng AI."
      );
      setQuestions([]);
      setActiveTab("generate");
    } else {
      console.error("Lỗi thực sự khi fetch questions:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi kết nối đến server.");
    }
  } finally {
    console.log("Kết thúc fetch questions");
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

  const gradeSingleQuestion = async (questionId) => {
    const answerText = answers[questionId];
    const audioUri = recordings[questionId];

    if ((!answerText || answerText.trim() === "") && !audioUri) {
      Alert.alert(
        "Thông báo",
        "Vui lòng ghi âm câu trả lời trước khi chấm điểm."
      );
      return;
    }

    setGradingQuestions((prev) => ({ ...prev, [questionId]: true }));

    try {
      let gradeResult;
      let transcribedText = answerText;

      if (audioUri && (!answerText || answerText.trim() === "")) {
        setAiThinking(true);
        transcribedText = await uploadAndTranscribeAudio(questionId);
      }

      gradeResult = await QuestionApiService.gradeAnswer(
        user.id,
        questionId,
        transcribedText
      );

      console.log("Grade result:", gradeResult);

      setScores((prev) => ({
        ...prev,
        [questionId]: gradeResult,
      }));
    } catch (err) {
      console.error("Lỗi khi chấm điểm:", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || "Lỗi kết nối khi chấm điểm.";
      Alert.alert("Lỗi", `Không thể chấm điểm: ${errorMessage}`);
    } finally {
      setGradingQuestions((prev) => ({ ...prev, [questionId]: false }));
      setAiThinking(false);
    }
  };

  const gradeAllQuestions = async () => {
    const unansweredQuestions = questions.filter(
      (q) =>
        (!answers[q.id] || answers[q.id].trim() === "") && !recordings[q.id]
    );

    if (unansweredQuestions.length > 0) {
      Alert.alert(
        "Thông báo",
        `Bạn còn ${unansweredQuestions.length} câu hỏi chưa trả lời. Vui lòng ghi âm tất cả câu hỏi trước khi chấm điểm.`
      );
      return;
    }

    setAiThinking(true);

    try {
      const gradingResults = {};

      for (const question of questions) {
        let transcribedText = answers[question.id];

        if (
          recordings[question.id] &&
          (!answers[question.id] || answers[question.id].trim() === "")
        ) {
          try {
            transcribedText = await uploadAndTranscribeAudio(question.id);
          } catch (err) {
            console.error(`Lỗi transcribe cho câu hỏi ${question.id}:`, err);
            continue;
          }
        }

        const gradeResult = await QuestionApiService.gradeAnswer(
          user.id,
          question.id,
          transcribedText
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
          setRecordings({});
          setPlayingRecordings({});
          setActiveTab("bank");
          if (recording) {
            stopRecording();
          }
          Object.values(soundRefs.current).forEach((sound) => {
            if (sound) {
              sound.unloadAsync();
            }
          });
          soundRefs.current = {};

          fetchProfile();
        },
      },
    ]);
  };

  const levelItems = [
    { label: "Intern", value: "intern" },
    { label: "Fresher", value: "fresher" },
    { label: "Junior", value: "junior" },
    { label: "Middle", value: "middle" },
    { label: "Senior", value: "senior" },
  ];

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Luyện phỏng vấn cùng AI</Text>
          <TouchableOpacity onPress={handleReset}>
            <Icon name="reload" size={30} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={aiThinking}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.fullscreenModalContainer}>
            <Image
              source={require("../../../assets/AI_loading.gif")}
              style={styles.centeredGif}
              resizeMode="cover"
            />
            <View style={styles.overlayContent}>
              <Text style={styles.fullscreenModalSubText}>
                Vui lòng chờ trong giây lát...
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.label}>Ngành nghề (từ hồ sơ):</Text>
        <Text style={styles.value}>{industry}</Text>

        <Text style={styles.label}>Chọn cấp độ:</Text>

        {/* Picker Select với style đã fix */}
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => {
              console.log("Picker value changed:", value);
              setLevel(value);
            }}
            value={level}
            placeholder={{
              label: "Chọn cấp độ...",
              value: null,
              color: "#999",
            }}
            items={levelItems}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            Icon={() => {
              return (
                <Icon
                  name="chevron-down"
                  size={20}
                  color="#666"
                  style={styles.pickerIcon}
                />
              );
            }}
            touchableWrapperProps={{
              activeOpacity: 0.7,
            }}
            onOpen={() => console.log("Picker opened")}
            onClose={() => console.log("Picker closed")}
          />
        </View>

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
              Ngân hàng câu hỏi
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

        <TouchableOpacity
          style={[
            styles.button,
            (!level || aiThinking) && styles.disabledButton,
          ]}
          onPress={
            activeTab === "bank" ? fetchQuestionsFromBank : generateNewQuestions
          }
          disabled={!level || aiThinking}
        >
          {aiThinking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon
              name={
                activeTab === "bank" ? "search-outline" : "sparkles-outline"
              }
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

                  {scores[q.id] && (
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>
                        Điểm: {scores[q.id].score || "N/A"}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.audioSection}>
                  <Text style={styles.audioLabel}>Ghi âm câu trả lời:</Text>

                  <View style={styles.audioButtons}>
                    <TouchableOpacity
                      style={[
                        styles.audioButton,
                        isRecording &&
                          currentRecordingQuestion === q.id &&
                          styles.recordingButton,
                      ]}
                      onPress={
                        isRecording && currentRecordingQuestion === q.id
                          ? stopRecording
                          : () => startRecording(q.id)
                      }
                      disabled={
                        isRecording && currentRecordingQuestion !== q.id
                      }
                    >
                      <Icon
                        name={
                          isRecording && currentRecordingQuestion === q.id
                            ? "stop-circle"
                            : "mic"
                        }
                        size={20}
                        color={
                          isRecording && currentRecordingQuestion === q.id
                            ? "#fff"
                            : PRIMARY_COLOR
                        }
                      />
                      <Text
                        style={[
                          styles.audioButtonText,
                          isRecording &&
                            currentRecordingQuestion === q.id &&
                            styles.recordingButtonText,
                        ]}
                      >
                        {isRecording && currentRecordingQuestion === q.id
                          ? "Dừng"
                          : "Ghi âm"}
                      </Text>
                    </TouchableOpacity>

                    {recordings[q.id] && (
                      <View style={styles.playbackControls}>
                        <TouchableOpacity
                          style={[styles.audioButton, styles.playButton]}
                          onPress={() => playRecording(q.id)}
                        >
                          <Icon
                            name={
                              playingRecordings[q.id]
                                ? "pause-circle"
                                : "play-circle"
                            }
                            size={20}
                            color="#fff"
                          />
                          <Text style={styles.audioButtonText}>
                            {playingRecordings[q.id] ? "Dừng" : "Nghe"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.audioButton, styles.deleteButton]}
                          onPress={() => deleteRecording(q.id)}
                        >
                          <Icon name="close-circle" size={20} color="#fff" />
                          <Text style={styles.audioButtonText}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {isRecording && currentRecordingQuestion === q.id && (
                    <View style={styles.recordingStatus}>
                      <Icon name="radio-button-on" size={16} color="#ff3b30" />
                      <Text style={styles.recordingText}>Đang ghi âm...</Text>
                    </View>
                  )}

                  {answers[q.id] && (
                    <View style={styles.transcribedTextContainer}>
                      <Text style={styles.transcribedLabel}>
                        Câu trả lời của bạn:
                      </Text>
                      <Text style={styles.transcribedText}>
                        {answers[q.id]}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.gradeButton,
                    !recordings[q.id] &&
                      (!answers[q.id] || answers[q.id].trim() === "") &&
                      styles.disabledGradeButton,
                  ]}
                  onPress={() => gradeSingleQuestion(q.id)}
                  disabled={
                    (!recordings[q.id] &&
                      (!answers[q.id] || answers[q.id].trim() === "")) ||
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
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  fixedHeader: {
    backgroundColor: "#f6f8fa",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  pickerWrapper: {
    marginBottom: 15,
  },
  pickerIcon: {
    marginTop: 12,
    marginRight: 8,
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
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
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
  questionsContainer: {
    marginTop: 20,
  },
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
    marginBottom: 15,
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
  audioSection: {
    marginBottom: 15,
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  audioButtons: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  playbackControls: {
    flexDirection: "row",
    gap: 10,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#fff",
  },
  recordingButton: {
    backgroundColor: "#ff3b30",
    borderColor: "#ff3b30",
  },
  playButton: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    borderColor: "#ff3b30",
  },
  audioButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
  recordingButtonText: {
    color: "#fff",
  },
  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 6,
    backgroundColor: "#fff0f0",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  recordingText: {
    fontSize: 12,
    color: "#ff3b30",
    fontWeight: "600",
  },
  transcribedTextContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_COLOR,
  },
  transcribedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginBottom: 5,
  },
  transcribedText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  gradeButton: {
    backgroundColor: "#ff6b35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
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
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenModalContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredGif: {
    width: "400",
    height: "400",
    borderRadius: 200,
    overflow: "hidden",
  },
  overlayContent: {
    position: "absolute",
    bottom: 100,
  },
  fullscreenModalSubText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    backgroundColor: "#fff",
    paddingRight: 40,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    backgroundColor: "#fff",
    paddingRight: 40,
  },
  placeholder: {
    color: "#999",
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
});
