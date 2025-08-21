const supabase = require('../../supabase/config');

class AuthController {
    async googleLogin(req, res) {
        try {
            const { id_token } = req.body;  // nhận từ client Expo

            if (!id_token) {
                return res.status(400).json({ error: "Thiếu id_token" });
            }

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: id_token,
            });

            if (error) return res.status(400).json({ error: error.message });
            res.json({ session: data.session, user: data.user });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new AuthController();
