/**
 * useJobActions Hook
 * Handles job-related actions with notification triggers
 */
import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export const useJobActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { triggerJobSaved, triggerJobApplication, refreshNotifications } = useNotifications();
    const { user, userRole } = useAuth();

    /**
     * Save job with notification trigger
     * @param {string} jobId - Job ID to save
     * @param {object} jobData - Job details
     * @param {string} employerId - Employer ID who owns the job
     */
    const saveJobWithNotification = async (jobId, jobData, employerId) => {
        if (!user?.id || userRole !== 'candidate') {
            console.error('useJobActions: Invalid user or not a candidate');
            return { success: false, error: 'Invalid user' };
        }

        setLoading(true);
        setError(null);

        try {
            // First, save the job (your existing save job API call)
            console.log(' useJobActions: START - Saving job:', jobId, 'for candidate:', user.id);
            console.log(' Job data:', JSON.stringify(jobData, null, 2));
            console.log(' Employer ID:', employerId);
            
            // TODO: Replace this with your actual save job API call
            const saveResponse = await fetch(`http://192.168.1.3:3000/job/saveJob`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth headers if needed
                },
                body: JSON.stringify({
                    job_id: jobId,
                    candidate_id: user.id
                })
            });

            if (!saveResponse.ok) {
                throw new Error(`Failed to save job: ${saveResponse.statusText}`);
            }

            const saveResult = await saveResponse.json();
            console.log(' useJobActions: Job saved successfully:', JSON.stringify(saveResult, null, 2));

            // Then trigger notification for employer
            if (employerId) {
                console.log(' useJobActions: Triggering job saved notification for employer:', employerId);
                
                await triggerJobSaved(
                    user.id, // candidateId
                    jobId,
                    jobData,
                    employerId
                );

                console.log(' useJobActions: Job saved notification triggered successfully');
            } else {
                console.warn(' useJobActions: No employerId provided, skipping notification');
            }

            return { success: true, data: saveResult };

        } catch (error) {
            console.error(' useJobActions: Error saving job with notification:', error);
            console.error(' Error details:', error.message);
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Apply for job with notification trigger
     * @param {string} jobId - Job ID to apply for
     * @param {object} jobData - Job details
     * @param {string} employerId - Employer ID who owns the job
     * @param {object} applicationData - Application data (CV, cover letter, etc.)
     */
    const applyJobWithNotification = async (jobId, jobData, employerId, applicationData) => {
        if (!user?.id || userRole !== 'candidate') {
            console.error('useJobActions: Invalid user or not a candidate');
            return { success: false, error: 'Invalid user' };
        }

        setLoading(true);
        setError(null);

        try {
            // First, submit job application (your existing apply job API call)
            console.log('useJobActions: Applying for job:', jobId, 'for candidate:', user.id);
            
            // TODO: Replace this with your actual apply job API call
            const applyResponse = await fetch(`${process.env.EXPO_PUBLIC_API}/jobs/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth headers if needed
                },
                body: JSON.stringify({
                    job_id: jobId,
                    candidate_id: user.id,
                    ...applicationData
                })
            });

            if (!applyResponse.ok) {
                throw new Error(`Failed to apply for job: ${applyResponse.statusText}`);
            }

            const applyResult = await applyResponse.json();
            console.log('useJobActions: Job application submitted successfully:', applyResult);

            // Then trigger notification for employer
            if (employerId) {
                console.log('useJobActions: Triggering job application notification for employer:', employerId);
                
                await triggerJobApplication(
                    user.id, // candidateId
                    jobId,
                    jobData,
                    employerId,
                    { name: user.name, email: user.email } // candidateData
                );

                console.log('useJobActions: Job application notification triggered successfully');
            }

            return { success: true, data: applyResult };

        } catch (error) {
            console.error('useJobActions: Error applying for job with notification:', error);
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a test job saved notification (for development)
     */
    const testJobSavedNotification = async () => {
        if (!user?.id) {
            console.error('useJobActions: No user logged in');
            return;
        }

        try {
            console.log('useJobActions: Creating test job saved notification');
            
            const testJobData = {
                title: 'Senior React Native Developer',
                company_name: 'Tech Corp',
                location: 'Ho Chi Minh City',
                salary: '25-30 triệu VND'
            };

            // For testing, we'll create a notification for the same user
            // In real scenario, this would be for the employer
            await triggerJobSaved(
                user.id, // candidateId (in test, same as employer)
                'test-job-123',
                testJobData,
                user.id // employerId (in test, same as candidate)
            );

            // Refresh notifications to show the new one
            setTimeout(() => {
                refreshNotifications();
            }, 1000);

            console.log('useJobActions: Test job saved notification created');
            return { success: true };

        } catch (error) {
            console.error('useJobActions: Error creating test notification:', error);
            return { success: false, error: error.message };
        }
    };

    return {
        saveJobWithNotification,
        applyJobWithNotification,
        testJobSavedNotification,
        loading,
        error
    };
};