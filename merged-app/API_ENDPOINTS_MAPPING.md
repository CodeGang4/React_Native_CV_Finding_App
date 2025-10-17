# API Endpoints Mapping - Backend vs Frontend

## Backend Routes Structure (from routes/index.js)

### Client Routes (prefix: /client)
- `/client/saveJobs` - SaveJobRouter
- `/client/user` - UserRouter  
- `/client/auth` - AuthRouter
- `/client/interview-practice` - InterviewPracticeRouter
- `/client/candidates` - CandidatesRouter
- `/client/podcast` - PodcastRouter
- `/client/savePodcast` - SavePodcastRouter

### Admin/Shared Routes (no prefix)
- `/admin/questions` - QuestionRouter
- `/application` - ApplicationRouter
- `/notice` - NotificationRouter

### Employer Routes (no prefix)
- `/job` - JobRouter
- `/employer` - EmployerRouter
- `/email` - EmailRouter
- `/email-template` - EmailTemplatesRouter
- `/interview-schedule` - InterviewScheduleRouter

## Current Frontend API Services Status

### ✅ FIXED - Using correct endpoints
1. **AuthApiService** - Uses `/client/auth` ✅
2. **NotificationApiService** - Uses `/notice` ✅
3. **ApplicationApiService** - Uses `/application` ✅
4. **UserApiService** - Uses `/client/user` ✅ (Updated to match backend routes)
5. **JobApiService** - Uses `/job` ✅ (Updated to match backend routes)
6. **CompanyApiService** - Uses `/employer` ✅ (Updated to match backend routes)
7. **InterviewApiService** - Uses `/interview-schedule` ✅ (Updated to match backend routes)
8. **HomeApiService** - Mixed endpoints, using correct ones ✅

### ✅ ALL FIXED 
1. **CandidateApiService** - Uses `/client/candidates` ✅ (Updated to match backend routes)

### 📋 SUMMARY 
All API services have been updated to match backend routes:
- Removed non-existent endpoints 
- Fixed parameter names and route paths
- Added rate limiting protection to ApplicationApiService
- Added EmailTemplateRouter fix for getTemplates by employerId
- Created fallback methods for missing backend features

### 🔄 RATE LIMITING ISSUES
- EmailTemplateRepository getting HTTP 429 on `/email-template/getTemplates/:employerId`
- Need to implement request queuing and retry logic

## Action Plan - COMPLETED ✅
1. ✅ Fix ApplicationApiService with rate limiting protection
2. ✅ Fix JobApiService endpoints (updated to match backend routes) 
3. ✅ Fix CompanyApiService endpoints (updated to use /employer)
4. ✅ Fix InterviewApiService endpoints (updated to use /interview-schedule)
5. ✅ Fix HomeApiService mixed endpoints (already correct)
6. ✅ Add rate limiting protection to ApplicationApiService
7. ✅ Fix EmailTemplateRouter to support getTemplates by employerId
8. ✅ Fix UserApiService endpoints (updated to match backend routes)
9. ✅ Fix CandidateApiService endpoints (updated to match backend routes)

## Rate Limiting Strategy
- Batch requests in groups of 3
- Add 200ms delay between batches  
- Implement exponential backoff for retries
- Cache results to reduce API calls
- Add request queue management