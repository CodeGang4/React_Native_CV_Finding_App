import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { EnhancedAIService } from "../../../shared/services/business/EnhancedAIService";
import { QuotaLimitNotice } from "../../../shared/components/QuotaLimitNotice";
import { AnalysisCacheManager } from "../../../shared/services/business/AnalysisCacheManager";

const AICandidateInsights = ({
  visible,
  candidates = [],
  onClose,
  onSelectCandidate,
  searchCriteria = {},
}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [analyzedCandidates, setAnalyzedCandidates] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAllMode, setShowAllMode] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showQuotaNotice, setShowQuotaNotice] = useState(false);

  useEffect(() => {
    console.log(
      "🔥 useEffect triggered: visible =",
      visible,
      "candidates.length =",
      candidates.length
    );
    if (visible && candidates.length > 0) {
      // Reset states khi modal mở
      console.log("🔥 useEffect: Resetting states and starting analysis");
      setLoading(true);
      setError(null);
      setAnalyzedCandidates([]);
      setAnalysisResult(null);
      setShowAllMode(false);
      setLoadingMore(false);

      // Bắt đầu với phân tích nhanh (top 20)
      analyzeAllCandidates(false, 0);
    } else if (!visible) {
      // Reset states khi modal đóng
      console.log("🔥 useEffect: Modal closed, resetting states");
      setLoading(false);
      setError(null);
      setAnalyzedCandidates([]);
      setAnalysisResult(null);
      setShowAllMode(false);
      setLoadingMore(false);
    }
  }, [visible]); // 🔥 REMOVE candidates dependency để tránh re-trigger

  const analyzeAllCandidates = async (showAll = false, offset = 0) => {
    try {
      const isLoadingMore = offset > 0;

      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      console.log(
        "🤖 Bắt đầu phân tích AI cho",
        candidates.length,
        "ứng viên",
        showAll ? "(Tất cả)" : "(Top 20)",
        "offset:",
        offset
      );

      // 📂 Kiểm tra cache trước khi gọi API
      const candidateIds = candidates.map((c) => c.id || c.candidate_id);
      const cacheResult = await AnalysisCacheManager.getBatchAnalysis(
        candidateIds,
        searchCriteria
      );

      console.log(
        `📂 Cache check: ${cacheResult.cachedResults.length} cached, ${cacheResult.missingIds.length} need analysis`
      );

      let result;
      if (cacheResult.missingIds.length === 0) {
        // ✅ Tất cả đều có trong cache
        console.log("🎯 All candidates found in cache!");
        result = {
          candidates: cacheResult.cachedResults,
          performance: {
            totalCandidates: cacheResult.cachedResults.length,
            processingTime: 0,
            fromCache: true,
          },
        };
      } else {
        // 🤖 Chỉ phân tích những ứng viên chưa có cache
        const candidatesToAnalyze = candidates.filter((c) =>
          cacheResult.missingIds.includes(c.id || c.candidate_id)
        );

        result = await EnhancedAIService.analyzeAndRankCandidates(
          candidatesToAnalyze,
          {
            ...searchCriteria,
            limit: showAll ? 50 : 20,
            offset: offset,
            showAll: showAll,
          }
        );

        // 💾 Cache kết quả mới
        if (result.candidates && result.candidates.length > 0) {
          await AnalysisCacheManager.saveBatchAnalysis(
            result.candidates,
            searchCriteria
          );
        }

        // 🔄 Kết hợp cache với kết quả mới
        result.candidates = [
          ...cacheResult.cachedResults,
          ...result.candidates,
        ];
        console.log(
          `💾 Saved ${
            result.candidates.length - cacheResult.cachedResults.length
          } new analyses to cache`
        );
      }

      console.log("🔥 AI Analysis Result:", result);
      console.log(
        "🔥 AI Analysis Candidates count:",
        result.candidates?.length
      );
      console.log("🔥 First candidate example:", result.candidates?.[0]);

      if (isLoadingMore) {
        // Thêm ứng viên mới vào danh sách hiện tại
        setAnalyzedCandidates((prev) => [...prev, ...result.candidates]);
        console.log("✅ Đã tải thêm", result.candidates.length, "ứng viên");
      } else {
        // Thiết lập kết quả phân tích ban đầu
        setAnalysisResult(result);
        setAnalyzedCandidates(result.candidates);
        setShowAllMode(showAll);
        console.log(
          "✅ Hoàn thành phân tích AI:",
          result.candidates.length,
          "ứng viên"
        );
        console.log("📊 Performance:", result.performance);
        console.log(
          "🔥 About to set loading to false, analyzedCandidates count:",
          result.candidates.length
        );

        // 🔥 Force update loading state với timeout
        setTimeout(() => {
          setLoading(false);
          console.log("🔥 TIMEOUT: Force set loading to false");
        }, 100);
      }
    } catch (error) {
      console.error("❌ Lỗi phân tích AI:", error);

      // Kiểm tra nếu là lỗi quota limit
      if (
        error.message &&
        error.message.includes("429") &&
        error.message.includes("quota")
      ) {
        console.warn("⚠️ Quota limit detected, showing notice");
        setShowQuotaNotice(true);
        setError("Đã vượt quá giới hạn API. Hệ thống sẽ retry tự động.");
      } else {
        setError("Không thể phân tích ứng viên. Vui lòng thử lại.");
      }
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
        console.log("🔥 Set loadingMore to false");
      } else {
        console.log("🔥 FINALLY: About to set loading to false");
        setLoading(false); // 🔥 QUAN TRỌNG: Set loading = false để hiển thị kết quả
        console.log("🔥 FINALLY: Called setLoading(false)");
      }
    }
  };

  const handleShowAllCandidates = () => {
    setShowAllMode(true);
    analyzeAllCandidates(true, 0);
  };

  const handleLoadMore = () => {
    if (analysisResult && analysisResult.hasMore && !loadingMore) {
      const nextOffset = analyzedCandidates.length;
      analyzeAllCandidates(showAllMode, nextOffset);
    }
  };

  const renderCandidateCard = (candidate) => (
    <View key={candidate.id} style={styles.candidateCard}>
      {/* Header với thông tin cơ bản */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={24} color="#4CAF50" />
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{candidate.aiRank}</Text>
          </View>
        </View>

        <View style={styles.candidateInfo}>
          <Text style={styles.candidateName}>{candidate.name}</Text>
          <Text style={styles.candidateTitle}>{candidate.title}</Text>
          <Text style={styles.candidateLocation}>{candidate.location}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.aiScore}>{Math.round(candidate.aiScore)}</Text>
          <Text style={styles.scoreLabel}>AI Score</Text>
          <View style={[styles.tierBadge, getTierStyle(candidate.aiTier)]}>
            <Text style={[styles.tierText, getTierTextStyle(candidate.aiTier)]}>
              {candidate.aiTier}
            </Text>
          </View>
        </View>
      </View>

      {/* Fit Prediction */}
      <View style={styles.fitContainer}>
        <Text style={styles.fitLabel}>Khả năng phù hợp: </Text>
        <View style={styles.fitBar}>
          <View
            style={[styles.fitFill, { width: `${candidate.fitPrediction}%` }]}
          />
        </View>
        <Text style={styles.fitPercentage}>
          {Math.round(candidate.fitPrediction)}%
        </Text>
      </View>

      {/* Key Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>🎯 Điểm nổi bật:</Text>
        {(candidate.aiRecommendations || [])
          .slice(0, 2)
          .map((recommendation, index) => (
            <Text key={index} style={styles.insightItem}>
              • {recommendation}
            </Text>
          ))}
      </View>

      {/* Skills Analysis */}
      <View style={styles.skillsContainer}>
        <Text style={styles.skillsTitle}>💼 Phân tích kỹ năng:</Text>
        <View style={styles.skillsRow}>
          <View style={styles.skillStat}>
            <Text style={styles.skillNumber}>
              {candidate.skillsAnalysis?.requiredSkillsMatch || 0}
            </Text>
            <Text style={styles.skillLabel}>Kỹ năng khớp</Text>
          </View>
          <View style={styles.skillStat}>
            <Text style={styles.skillNumber}>
              {candidate.skillsAnalysis?.totalSkills || 0}
            </Text>
            <Text style={styles.skillLabel}>Tổng kỹ năng</Text>
          </View>
          <View style={styles.skillStat}>
            <Text style={styles.skillNumber}>
              {candidate.experienceAnalysis?.totalYears || 0}
            </Text>
            <Text style={styles.skillLabel}>Năm KN</Text>
          </View>
        </View>
      </View>

      {/* Risk Factors */}
      {candidate.riskFactors?.length > 0 && (
        <View style={styles.riskContainer}>
          <Text style={styles.riskTitle}>⚠️ Cần lưu ý:</Text>
          {candidate.riskFactors.slice(0, 1).map((risk, index) => (
            <Text key={index} style={styles.riskItem}>
              • {risk}
            </Text>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            // 📱 Navigate to candidate detail screen
            navigation.navigate("CandidateDetail", {
              candidate: candidate,
              analysisResult: candidate, // Pass analysis result
            });
            // Close modal after navigation
            onClose && onClose();
          }}
        >
          <MaterialIcons name="person" size={16} color="#fff" />
          <Text style={styles.selectButtonText}>Xem hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailModal = () => (
    <Modal
      visible={!!selectedInsight}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.detailModal}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>
            Phân tích AI chi tiết - {selectedInsight?.name}
          </Text>
          <TouchableOpacity onPress={() => setSelectedInsight(null)}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          {selectedInsight && (
            <>
              {/* Overall Score */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  📊 Điểm số tổng quan
                </Text>
                <View style={styles.scoreDetail}>
                  <Text style={styles.scoreDetailText}>
                    AI Score:{" "}
                    <Text style={styles.bold}>
                      {Math.round(selectedInsight.aiScore)}/100
                    </Text>
                  </Text>
                  <Text style={styles.scoreDetailText}>
                    Fit Prediction:{" "}
                    <Text style={styles.bold}>
                      {Math.round(selectedInsight.fitPrediction)}%
                    </Text>
                  </Text>
                  <Text style={styles.scoreDetailText}>
                    Tier:{" "}
                    <Text style={styles.bold}>{selectedInsight.aiTier}</Text>
                  </Text>
                </View>
              </View>

              {/* Skills Analysis */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  💼 Phân tích kỹ năng
                </Text>
                <Text style={styles.detailText}>
                  Kỹ năng khớp yêu cầu:{" "}
                  {selectedInsight.skillsAnalysis.requiredSkillsMatch}
                </Text>
                <Text style={styles.detailText}>
                  Tổng số kỹ năng: {selectedInsight.skillsAnalysis.totalSkills}
                </Text>
                <Text style={styles.detailText}>
                  Trình độ kỹ năng: {selectedInsight.skillsAnalysis.skillLevel}
                </Text>
                {selectedInsight.skillsAnalysis.skillGaps.length > 0 && (
                  <Text style={styles.detailText}>
                    Kỹ năng còn thiếu:{" "}
                    {selectedInsight.skillsAnalysis.skillGaps.join(", ")}
                  </Text>
                )}
              </View>

              {/* Experience Analysis */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  💼 Phân tích kinh nghiệm
                </Text>
                <Text style={styles.detailText}>
                  Tổng số năm kinh nghiệm:{" "}
                  {selectedInsight.experienceAnalysis.totalYears}
                </Text>
                <Text style={styles.detailText}>
                  Số lần thay đổi công việc:{" "}
                  {selectedInsight.experienceAnalysis.jobChanges}
                </Text>
                <Text style={styles.detailText}>
                  Kinh nghiệm lãnh đạo:{" "}
                  {selectedInsight.experienceAnalysis.leadershipExperience
                    ? "Có"
                    : "Chưa có"}
                </Text>
                <Text style={styles.detailText}>
                  Phát triển sự nghiệp:{" "}
                  {selectedInsight.experienceAnalysis.careerProgression}
                </Text>
              </View>

              {/* Education Analysis */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  🎓 Phân tích học vấn
                </Text>
                <Text style={styles.detailText}>
                  Bằng cấp cao nhất:{" "}
                  {selectedInsight.educationAnalysis.highestDegree}
                </Text>
                <Text style={styles.detailText}>
                  Học vấn liên quan:{" "}
                  {selectedInsight.educationAnalysis.relevantDegree
                    ? "Có"
                    : "Không"}
                </Text>
                <Text style={styles.detailText}>
                  Số chứng chỉ:{" "}
                  {selectedInsight.educationAnalysis.certificationCount}
                </Text>
                <Text style={styles.detailText}>
                  Học tập liên tục:{" "}
                  {selectedInsight.educationAnalysis.continuousLearning
                    ? "Có"
                    : "Không"}
                </Text>
              </View>

              {/* Strengths & Weaknesses */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  ⚖️ Điểm mạnh & Điểm yếu
                </Text>
                <Text style={styles.subTitle}>Điểm mạnh:</Text>
                {selectedInsight.strengthsAndWeaknesses.strengths.map(
                  (strength, index) => (
                    <Text key={index} style={styles.detailListItem}>
                      • {strength}
                    </Text>
                  )
                )}

                {selectedInsight.strengthsAndWeaknesses.weaknesses.length >
                  0 && (
                  <>
                    <Text style={styles.subTitle}>Điểm cần cải thiện:</Text>
                    {selectedInsight.strengthsAndWeaknesses.weaknesses.map(
                      (weakness, index) => (
                        <Text key={index} style={styles.detailListItem}>
                          • {weakness}
                        </Text>
                      )
                    )}
                  </>
                )}
              </View>

              {/* AI Recommendations */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>🎯 Gợi ý từ AI</Text>
                {selectedInsight.aiRecommendations.map(
                  (recommendation, index) => (
                    <Text key={index} style={styles.detailListItem}>
                      • {recommendation}
                    </Text>
                  )
                )}
              </View>

              {/* Interview Questions */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  ❓ Câu hỏi phỏng vấn gợi ý
                </Text>
                {selectedInsight.suggestedInterviewQuestions.map(
                  (question, index) => (
                    <Text key={index} style={styles.questionItem}>
                      {index + 1}. {question}
                    </Text>
                  )
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const getTierStyle = (tier) => {
    switch (tier) {
      case "Xuất sắc":
        return { backgroundColor: "#4CAF50" };
      case "Tốt":
        return { backgroundColor: "#2196F3" };
      case "Trung bình":
        return { backgroundColor: "#FF9800" };
      default:
        return { backgroundColor: "#757575" };
    }
  };

  const getTierTextStyle = (tier) => {
    return { color: "#fff" };
  };

  // 📊 Show cache statistics
  const showCacheStats = async () => {
    try {
      const stats = await AnalysisCacheManager.getCacheStats();
      Alert.alert(
        "📊 Cache Statistics",
        `Cached Analyses: ${stats.totalEntries}/${stats.maxEntries}\n` +
          `Cache Size: ${(stats.totalSize / 1024).toFixed(2)} KB\n` +
          `Cache Duration: ${stats.cacheDuration}\n\n` +
          `Cache giúp tiết kiệm quota API khi xem lại kết quả phân tích.`,
        [
          { text: "🧹 Clear Cache", onPress: clearCache, style: "destructive" },
          { text: "OK", style: "default" },
        ]
      );
    } catch (error) {
      console.error("Error getting cache stats:", error);
    }
  };

  // 🧹 Clear cache
  const clearCache = async () => {
    try {
      await AnalysisCacheManager.clearAllCache();
      Alert.alert("✅ Success", "Cache cleared successfully!");
    } catch (error) {
      console.error("Error clearing cache:", error);
      Alert.alert("❌ Error", "Failed to clear cache");
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>🤖 Gợi ý ứng viên AI</Text>
          <View style={styles.headerActions}>
            {/* <TouchableOpacity
              style={styles.cacheButton}
              onPress={showCacheStats}
            >
              <MaterialIcons name="storage" size={20} color="#666" />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={analyzeAllCandidates}>
              <MaterialIcons name="refresh" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* <Text style={styles.subtitle}>
          Phân tích {candidates.length} ứng viên bằng AI
        </Text> */}

        {/* AI Analysis Statistics */}
        {/* {analysisResult && !loading && (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {analyzedCandidates.length}
                </Text>
                <Text style={styles.statLabel}>Đã phân tích</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {analysisResult.performance?.totalTime || 0}ms
                </Text>
                <Text style={styles.statLabel}>Thời gian</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {analysisResult.performance?.analysisSpeed || 0}/s
                </Text>
                <Text style={styles.statLabel}>Tốc độ</Text>
              </View>
              {analysisResult.performance?.fromCache && (
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: "#4CAF50" }]}>
                    💾
                  </Text>
                  <Text style={styles.statLabel}>Cache</Text>
                </View>
              )}
            </View>

            {!showAllMode && analysisResult.hasMore && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={handleShowAllCandidates}
              >
                <MaterialIcons name="expand-more" size={20} color="#4CAF50" />
                <Text style={styles.showAllText}>
                  Hiển thị tất cả ({candidates.length} ứng viên)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )} */}

        {/* Content */}
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>
                Đang phân tích ứng viên bằng AI...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={48} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={analyzeAllCandidates}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : analyzedCandidates.length === 0 ? (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="search" size={48} color="#ccc" />
              <Text style={styles.loadingText}>
                Chưa có dữ liệu phân tích...
              </Text>
            </View>
          ) : (
            <>
              {analyzedCandidates.map(renderCandidateCard)}

              {/* Load More Button */}
              {analysisResult && analysisResult.hasMore && showAllMode && (
                <TouchableOpacity
                  style={[
                    styles.loadMoreButton,
                    loadingMore && styles.loadMoreButtonDisabled,
                  ]}
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <View style={styles.loadMoreContent}>
                      <ActivityIndicator size="small" color="#4CAF50" />
                      <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                    </View>
                  ) : (
                    <View style={styles.loadMoreContent}>
                      <MaterialIcons name="refresh" size={20} color="#4CAF50" />
                      <Text style={styles.loadMoreText}>
                        Tải thêm ứng viên (
                        {candidates.length - analyzedCandidates.length} còn lại)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* Analysis Complete Message */}
              {analysisResult && !analysisResult.hasMore && showAllMode && (
                <View style={styles.completeContainer}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4CAF50"
                  />
                  <Text style={styles.completeText}>
                    ✅ Đã phân tích tất cả {analyzedCandidates.length} ứng viên
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Detail Modal */}
        {renderDetailModal()}

        {/* Quota Limit Notice */}
        <QuotaLimitNotice
          visible={showQuotaNotice}
          onClose={() => setShowQuotaNotice(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cacheButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  candidateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  rankBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  candidateTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  candidateLocation: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: "center",
  },
  aiScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#666",
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  fitContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fitLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  fitBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginRight: 8,
  },
  fitFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  fitPercentage: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  insightsContainer: {
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  insightItem: {
    fontSize: 11,
    color: "#666",
    lineHeight: 16,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  skillStat: {
    alignItems: "center",
  },
  skillNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  skillLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  riskContainer: {
    marginBottom: 12,
    backgroundColor: "#fff3e0",
    padding: 8,
    borderRadius: 8,
  },
  riskTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f57c00",
    marginBottom: 4,
  },
  riskItem: {
    fontSize: 11,
    color: "#f57c00",
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  detailButtonText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  // Detail Modal Styles
  detailModal: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailSection: {
    marginVertical: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  scoreDetail: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  scoreDetailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  detailListItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
    paddingLeft: 8,
  },
  questionItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // AI Statistics Styles
  statsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  showAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 8,
  },

  // Load More Styles
  loadMoreButton: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    elevation: 1,
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 8,
  },
  completeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8f0",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  completeText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default AICandidateInsights;
