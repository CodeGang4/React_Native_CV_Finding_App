// services/notificationService.js
const admin = require("../supabase/firebaseConfig");

const sendNotification = async (token, title, body) => {
    const message = {
        token,
        notification: {
            title,
            body,
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ Notification sent successfully:", response);
    } catch (error) {
        console.error("❌ Error sending notification:", error);
    }
};


module.exports = { sendNotification };