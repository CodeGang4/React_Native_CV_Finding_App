import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import InterviewNotificationModal from "../../components/modals/InterviewNotificationModal";
import CandidateCard from "../../components/candidates/CandidateCard";
import SearchFiltersBar from "../../components/connect/SearchFiltersBar";
import CandidatePreviewSheet from "../../components/connect/CandidatePreviewSheet";
import AiSuggestionsModal from "../../components/connect/AiSuggestionsModal";
import AICandidateInsights from "../../components/connect/AICandidateInsights";
import { AISettingsModal } from "../../../shared/components/AISettingsModal";
import { colors } from "../../../shared/styles/colors";
import ConnectCandidateService from "../../../shared/services/business/ConnectCandidateService";
import AIService from "../../../shared/services/business/AIService";

export default function ConnectScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all"); // all | junior | mid | senior
  const [skills, setSkills] = useState([]); // selected skill tags
  const [selected, setSelected] = useState(null); // selected candidate
  const [showInvite, setShowInvite] = useState(false);
  // Candidate used for the Invite modal (separate from `selected` used by bottom sheet)
  const [inviteCandidate, setInviteCandidate] = useState(null);
  const [showAi, setShowAi] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

  // Backend integration state
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load candidates and skills from backend
  useEffect(() => {
    loadCandidatesFromBackend();
  }, []);

  const loadCandidatesFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load candidates
      const result = await ConnectCandidateService.getAllCandidates();
      setCandidates(result.candidates);

      console.log("Loaded candidates from backend:", result.candidates.length);

      // Debug: Log first candidate's avatar data
      if (result.candidates.length > 0) {
        const firstCandidate = result.candidates[0];
        console.log("🔍 Sample candidate avatar data:", {
          id: firstCandidate.id,
          name: firstCandidate.name,
          avatar: firstCandidate.avatar,
          avatarType: typeof firstCandidate.avatar,
          isUrl:
            firstCandidate.avatar &&
            (firstCandidate.avatar.startsWith("http") ||
              firstCandidate.avatar.startsWith("https")),
        });
      }
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const allSkills = useMemo(
    () =>
      Array.from(new Set(candidates.flatMap((c) => c.skills))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [candidates]
  );

  const filtered = candidates.filter((c) => {
    const matchQ =
      q.trim().length === 0 ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      c.location.toLowerCase().includes(q.toLowerCase());
    const matchLevel = level === "all" ? true : c.level === level;
    const matchSkills =
      skills.length === 0 || skills.every((s) => c.skills.includes(s));
    return matchQ && matchLevel && matchSkills;
  });

  // Gợi ý AI: ưu tiên theo kỹ năng đã chọn + cấp độ + từ khóa hiện tại
  const aiTop = useMemo(() => {
    return AIService.rankCandidates(
      candidates,
      {
        skills,
        level,
        query: q,
      },
      3
    );
  }, [candidates, skills, level, q]);

  const aiSimilar = useMemo(() => {
    if (!selected) return [];
    return AIService.findSimilarCandidates(candidates, selected, 5);
  }, [candidates, selected]);

  const toggleSkill = (s) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        translucent={false}
        backgroundColor={colors.primary}
        barStyle="light-content"
      />
      {/* Green background header area */}
      <View style={styles.headerBg} />
      <View style={styles.container}>
        <SearchFiltersBar
          q={q}
          onChangeQ={setQ}
          level={level}
          onChangeLevel={setLevel}
          allSkills={allSkills}
          selectedSkills={skills}
          onToggleSkill={toggleSkill}
          onOpenAi={() => setShowAi(true)}
          onOpenAIInsights={() => setShowAIInsights(true)}
          onOpenAISettings={() => setShowAISettings(true)}
          containerStyle={{ marginTop: -110 }}
        />

        <ScrollView style={styles.list}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                Đang tải danh sách ứng viên...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>
                Không thể tải danh sách ứng viên
              </Text>
              <Text style={styles.errorSubtext}>{error}</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                Không tìm thấy ứng viên phù hợp
              </Text>
              <Text style={styles.emptySubtext}>
                {candidates.length === 0
                  ? "Chưa có ứng viên nào trong hệ thống"
                  : "Hãy thử điều chỉnh bộ lọc tìm kiếm"}
              </Text>
            </View>
          ) : (
            filtered.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onPress={() =>
                  navigation.navigate("CandidateDetail", { candidate: c })
                }
                onInvite={() => {
                  // Open invite modal directly from the list card without opening the bottom sheet
                  setInviteCandidate(c);
                  setShowInvite(true);
                }}
                hideViewCV
                rightAccessory={
                  <MaterialIcons name="chevron-right" size={24} color="#999" />
                }
              />
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Candidate detail bottom sheet style */}
        <CandidatePreviewSheet
          selected={selected}
          aiSimilar={aiSimilar}
          onClose={() => setSelected(null)}
          onInvite={() => {
            if (selected) setInviteCandidate(selected);
            setSelected(null);
            setShowInvite(true);
          }}
          onSelectCandidate={(c) => setSelected(c)}
        />

        {/* AI Suggestions Modal */}
        <AiSuggestionsModal
          visible={showAi}
          candidates={aiTop}
          onClose={() => setShowAi(false)}
          onSelectCandidate={(c) => {
            setSelected(c);
            setShowAi(false);
          }}
        />

        {/* Enhanced AI Candidate Insights */}
        <AICandidateInsights
          visible={showAIInsights}
          candidates={filtered}
          onClose={() => setShowAIInsights(false)}
          onSelectCandidate={(candidate) => {
            setSelected(candidate);
            setShowAIInsights(false);
          }}
          searchCriteria={{
            requiredSkills: skills,
            preferredSkills: [],
            level: level,
            query: q,
            jobTitle: "",
            industry: "",
          }}
        />

        <InterviewNotificationModal
          visible={showInvite}
          onClose={() => {
            setShowInvite(false);
            setInviteCandidate(null);
          }}
          applicantName={inviteCandidate?.name || "Ứng viên"}
        />

        {/* AI Settings Modal */}
        <AISettingsModal
          visible={showAISettings}
          onClose={() => setShowAISettings(false)}
          onSave={() => {
            // Reload AI services sau khi cấu hình
            console.log("🔄 AI settings saved, reloading services...");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  headerBg: {
    backgroundColor: colors?.primary || "#00b14f",
    height: 120,
  },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { flex: 1, paddingHorizontal: 16 },
  score: { color: "#00b14f", fontWeight: "800" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
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
    paddingTop: 50,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6b6b",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
