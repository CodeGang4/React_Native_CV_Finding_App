import React from "react";
import { View, StyleSheet } from "react-native";
import CompanyInfoSection from "./CompanyInfoSection";
import CompanyAboutSection from "./CompanyAboutSection";
import RecruitmentSettingsSection from "./RecruitmentSettingsSection";

export default function CompanyTabSection({
  companyInfo,
  isRecruiting,
  onToggleRecruiting,
  allowContactFromCandidates,
  onToggleAllowContact,
  onEditCompany,
  loading = false,
  updating = false,
}) {
  return (
    <View style={styles.container}>
      <CompanyInfoSection
        companyInfo={companyInfo}
        onEdit={onEditCompany}
        loading={loading}
        updating={updating}
      />
      <CompanyAboutSection
        description={companyInfo.description}
        loading={loading}
      />
      <RecruitmentSettingsSection
        isRecruiting={isRecruiting}
        onToggleRecruiting={onToggleRecruiting}
        allowContactFromCandidates={allowContactFromCandidates}
        onToggleAllowContact={onToggleAllowContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
