const AuthRouter = require('./ClientRoutes/AuthRouter');
const UserRouter = require('./ClientRoutes/UserRouter');
const CandidatesRouter = require('./ClientRoutes/CandidatesRoutes');
const EmployerRouter = require('./EmployerRoutes/EmployerRoutes')
function route(app) {
    // Client Routes
    app.use('/client/user', UserRouter);
    app.use('/client/auth', AuthRouter);
    app.use('/client/candidates', CandidatesRouter);
    app.use('/client', (req, res) => {
        res.status(200).json({ message: "Client route" });
    })



    //Admin Routes
    //Employer Routes
    app.use('/employer', EmployerRouter);
}

module.exports = route;
