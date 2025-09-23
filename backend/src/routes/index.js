const AuthRouter = require('./ClientRoutes/AuthRouter');
const UserRouter = require('./ClientRoutes/UserRouter');
const CandidatesRouter = require('./ClientRoutes/CandidatesRoutes');
const EmployerRouter = require('./EmployerRoutes/EmployerRoutes');
const JobRouter = require('./EmployerRoutes/JobRouter');
const saveJobRouter = require('./ClientRoutes/SaveJobRouter');
const QuestionRouter = require('./AdminRoutes/QuestionRouter');
const InterviewPracticeRouter = require('./ClientRoutes/InterviewPracticeRouter');
const EmailRouter = require('./EmployerRoutes/EmailRouter');
const EmailTemplatesRouter = require('./EmployerRoutes/EmailTemplateRouter');
const InterviewScheduleRouter = require('./EmployerRoutes/InterviewScheduleRouter');
function route(app) {
    // Client Routes
    app.use('/client/saveJobs', saveJobRouter);
    app.use('/client/user', UserRouter);
    app.use('/client/auth', AuthRouter);
    app.use('/client/interview-practice', InterviewPracticeRouter);
    app.use('/client/candidates', CandidatesRouter);
    app.use('/client', (req, res) => {
        res.status(200).json({ message: 'Client route' });
    });

    //Admin Routes

    app.use('/admin/questions', QuestionRouter);

    //Employer Routes
    app.use('/job', JobRouter);
    app.use('/employer', EmployerRouter);
    app.use('/email', EmailRouter);
    app.use('/email-template', EmailTemplatesRouter);
    app.use('/interview-schedule', InterviewScheduleRouter);
}

module.exports = route;
