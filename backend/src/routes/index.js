const AuthRouter = require('./ClientRoutes/AuthRouter');

function route(app) {
    // Client Routes
    app.use('/client/auth', AuthRouter);
    app.use('/client', (req, res) => {
        res.status(200).json({ message: "Client route" });
    })



    //Admin Routes
    //Employer Routes
}

module.exports = route;
