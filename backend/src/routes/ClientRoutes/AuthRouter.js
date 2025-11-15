const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/AuthMiddlewares');
const AuthController = require('../../controllers/ClientControllers/AuthController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', verifyToken, AuthController.logout);
router.post('/reset-password', AuthController.resetPasswordForEmail);

// Debug routes
router.get('/debug/candidates', AuthController.checkCandidates);
router.get('/debug/users', AuthController.checkUsers);
router.get('/confirmed', (req, res) => {
    res.send(`
		<html>
			<head>
				<title>Email Confirmed</title>
				<style>
					body { font-family: sans-serif; text-align: center; margin-top: 100px; }
					.container { max-width: 400px; margin: auto; padding: 2em; border-radius: 8px; background: #f7f7f7; box-shadow: 0 2px 8px #ccc; }
					h1 { color: #2e7d32; }
					p { color: #333; }
					.btn { display: inline-block; margin-top: 2em; padding: 0.7em 2em; background: #2e7d32; color: #fff; border: none; border-radius: 4px; text-decoration: none; font-size: 1em; }
				</style>
			</head>
			<body>
				<div class="container">
					<h1>Email Confirmed!</h1>
					<p>Your email has been successfully confirmed.<br>
						 You can now return to the app and log in.</p>
					<a class="btn" href="myapp://login">Open App</a>
				</div>
			</body>
		</html>
	`);
});

module.exports = router;
