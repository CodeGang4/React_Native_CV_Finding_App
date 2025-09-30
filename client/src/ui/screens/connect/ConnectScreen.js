import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import InterviewNotificationModal from "../../components/modals/InterviewNotificationModal";
import CandidateCard from "../../components/candidates/CandidateCard";
import SearchFiltersBar from "../../components/connect/SearchFiltersBar";
import CandidatePreviewSheet from "../../components/connect/CandidatePreviewSheet";
import AiSuggestionsModal from "../../components/connect/AiSuggestionsModal";
import { colors } from "../../styles/colors";
import mockCandidates from "../../../repositories/local/mockCandidates";
import AIService from "../../../services/business/AIService";

export default function ConnectScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all"); // all | junior | mid | senior
  const [skills, setSkills] = useState([]); // selected skill tags
  const [selected, setSelected] = useState(null); // selected candidate
  const [showInvite, setShowInvite] = useState(false);
  // Candidate used for the Invite modal (separate from `selected` used by bottom sheet)
  const [inviteCandidate, setInviteCandidate] = useState(null);
  const [showAi, setShowAi] = useState(false);

  const candidates = mockCandidates;

  const allSkills = useMemo(
    () =>
      Array.from(new Set(candidates.flatMap((c) => c.skills))).sort((a, b) =>
        a.localeCompare(b)
      ),
    []
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
          containerStyle={{ marginTop: -110 }}
        />

        <ScrollView style={styles.list}>
          {filtered.map((c) => (
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
          ))}
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

        <InterviewNotificationModal
          visible={showInvite}
          onClose={() => {
            setShowInvite(false);
            setInviteCandidate(null);
          }}
          applicantName={inviteCandidate?.name || "Ứng viên"}
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
});
