import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  registerCallbacks,
  unregisterCallbacks,
} from "../../../../shared/services/utils/callbackRegistry";
import CommonHeader from "../../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../../shared/styles/layout";
import StatsBar from "../../../components/jobs/StatsBar";
import JobFiltersBar from "../../../components/jobs/JobFiltersBar";
import ActionsBar from "../../../components/jobs/ActionsBar";
import JobItem from "../../../components/jobs/JobItem";
import SwipeableJobCard from "../../../components/account/SwipeableJobCard";
import CreateJobModal from "../../../components/jobs/CreateJobModal";
import ManageTemplatesModal from "../../../components/jobs/ManageTemplatesModal";
import { useEmployerJobs } from "../../../../shared/hooks/useEmployerJobs";
import { useEmailTemplates } from "../../../../shared/hooks/useEmailTemplates";

export default function JobPostingPage() {
  const navigation = useNavigation();
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Use employer jobs hook for backend integration (reuse from account page)
  const {
    jobs,
    jobStats,
    loading,
    creating,
    updating,
    error,
    createJobWithFeedback,
    updateJobWithFeedback,
    deleteJobWithConfirmation,
    refreshJobs,
  } = useEmployerJobs();

  // Use email templates hook for backend integration
  const {
    templates,
    loading: templatesLoading,
    creating: templatesCreating,
    createTemplateWithFeedback,
    deleteTemplateWithConfirmation,
  } = useEmailTemplates();

  const handleCreatePress = () => setShowCreate(true);
  const handleManageTemplatesPress = () => setShowTemplates(true);

  // Setup job synchronization callbacks
  React.useEffect(() => {
    const callbacks = {
      onJobCreated: (newJob) => {
        // Refresh data when job is created from other pages
        refreshJobs();
      },
      onJobDeleted: (jobId) => {
        // Refresh data when job is deleted from other pages
        refreshJobs();
      },
    };

    registerCallbacks("jobSyncCallbacks", callbacks);

    return () => {
      unregisterCallbacks("jobSyncCallbacks");
    };
  }, [refreshJobs]);

  // Refresh jobs when returning to this screen (for updated view counts)
  useFocusEffect(
    React.useCallback(() => {
      // Refresh jobs data when screen is focused
      refreshJobs();

      // Emit event for job cards to refresh their stats
      setTimeout(() => {
        const { DeviceEventEmitter } = require("react-native");
        DeviceEventEmitter.emit("refreshJobCards");
      }, 100);
    }, [refreshJobs])
  );

  // Helper function to check if job is expired
  const isJobExpired = (job) => {
    if (!job.deadline || job.deadline === "N/A") return false;

    try {
      // Parse Vietnamese date format (dd/mm/yyyy)
      const dateParts = job.deadline.split("/");
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(dateParts[2], 10);
        const deadlineDate = new Date(year, month, day);
        const now = new Date();
        return deadlineDate < now;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Filter jobs locally (since useEmployerJobs doesn't have this function)
  const filterJobs = (statusFilter, searchQuery) => {
    return jobs.filter((job) => {
      // Status filter
      let matchStatus = true;
      if (statusFilter === "active") {
        matchStatus = job.status === "Đang tuyển" && !isJobExpired(job);
      } else if (statusFilter === "expired") {
        matchStatus = isJobExpired(job);
      } else if (statusFilter !== "all") {
        matchStatus = job.status === statusFilter;
      }

      // Search query filter
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        query.length === 0 ||
        (job.title || "").toLowerCase().includes(query) ||
        (job.location || "").toLowerCase().includes(query) ||
        (job.company || "").toLowerCase().includes(query);

      return matchStatus && matchQuery;
    });
  };

  const handleSubmitJob = async (jobData) => {
    const success = await createJobWithFeedback(jobData);
    if (success) {
      setShowCreate(false);
    }
  };

  const handleEditJob = async (updatedJob) => {
    const success = await updateJobWithFeedback(updatedJob.id, updatedJob);
    return success;
  };

  const handleDeleteJob = async (jobId) => {
    await deleteJobWithConfirmation(jobId);
  };

  const handleCreateTemplate = async (templateData) => {
    await createTemplateWithFeedback(templateData);
  };

  const handleUploadTemplate = async (templateData) => {
    // For uploaded templates, we can use the same create function
    await createTemplateWithFeedback({
      ...templateData,
      type: "uploaded",
    });
  };

  // Use filterJobs from hook instead of manual filtering
  const filteredJobs = filterJobs(statusFilter, searchText);

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Quản lý tuyển dụng"
        onBack={() => {}}
        showAI={false}
        showBackButton={false}
      />
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        <StatsBar
          jobs={jobStats.totalJobs}
          applications={jobStats.totalApplications}
          templates={templates.length}
          loading={loading}
        />
        <ActionsBar
          onCreatePress={handleCreatePress}
          onManageTemplatesPress={handleManageTemplatesPress}
          creating={creating}
        />
        <JobFiltersBar
          searchText={searchText}
          onChangeSearch={setSearchText}
          status={statusFilter}
          onChangeStatus={setStatusFilter}
        />
        <Text style={styles.sectionTitle}>Tin tuyển dụng gần đây</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Đang tải tin tuyển dụng...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshJobs}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {jobs.length === 0
                ? "Chưa có tin tuyển dụng nào"
                : "Không tìm thấy tin tuyển dụng phù hợp"}
            </Text>
          </View>
        ) : (
          <View>
            {filteredJobs.map((job) => (
              <SwipeableJobCard
                key={job.id}
                job={job}
                onPress={(j) => {
                  const cbKey = `jobdetail:${j.id}`;
                  registerCallbacks(cbKey, {
                    onEdit: handleEditJob,
                    onDelete: handleDeleteJob,
                  });
                  navigation.navigate("JobDetail", { job: j, cbKey });
                }}
                onDelete={handleDeleteJob}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <CreateJobModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleSubmitJob}
      />
      <ManageTemplatesModal
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templates}
        onCreate={handleCreateTemplate}
        onUpload={handleUploadTemplate}
        onDelete={deleteTemplateWithConfirmation}
        loading={templatesLoading}
        creating={templatesCreating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
