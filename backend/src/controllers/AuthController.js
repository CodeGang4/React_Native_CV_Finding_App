const supabase = require('../supabase/config');

class AuthController {
    static async googleLogin(req, res) {
        const { idToken } = req.body;

        // Verify the Google ID token
        const { user, error } = await supabase.auth.signInWithIdToken(idToken);

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Successful login
        return res.status(200).json({ user });
    }
}

module.exports = AuthController;
