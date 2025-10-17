const supabase = require('../../supabase/config');
const { sendNotification } = require('../../services/NotificationService');

class NotificationController {
    // Gửi push notification (Firebase)
    async sendPushNotification(req, res) {
        const { token, title, body } = req.body;

        if (!token || !title || !body) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        try {
            await sendNotification(token, title, body);
            return res.status(200).json({ message: "Notification sent successfully" });
        } catch (error) {
            console.error("Error sending notification:", error);
            return res.status(500).json({ error: "Failed to send notification" });
        }
    }

    // Tạo thông báo mới trong database
    async createNotification(req, res) {
        try {
            const {
                recipient_id,
                recipient_type,
                sender_id,
                sender_type,
                title,
                message,
                type = 'other',
                data = {}
            } = req.body;

            if (!recipient_id || !recipient_type || !title || !message) {
                return res.status(400).json({
                    error: 'recipient_id, recipient_type, title, and message are required'
                });
            }

            const { data: notification, error } = await supabase
                .from('notifications')
                .insert({
                    recipient_id,
                    recipient_type,
                    sender_id,
                    sender_type,
                    title,
                    message,
                    type,
                    data
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating notification:', error);
                return res.status(500).json({ error: 'Failed to create notification' });
            }

            res.status(201).json({
                success: true,
                data: notification
            });

        } catch (error) {
            console.error('Error in createNotification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Lấy thông báo của user
    async getUserNotifications(req, res) {
        try {
            const { userId } = req.params;
            const { 
                page = 1, 
                limit = 20, 
                unread_only = false,
                type 
            } = req.query;

            let query = supabase
                .from('notifications')
                .select(`
                    *,
                    sender:users!notifications_sender_id_fkey(
                        id,
                        username,
                        avatar,
                        role
                    )
                `)
                .eq('recipient_id', userId)
                .eq('is_archived', false)
                .order('created_at', { ascending: false });

            // Filter by read status
            if (unread_only === 'true') {
                query = query.eq('is_read', false);
            }

            // Filter by type
            if (type) {
                query = query.eq('type', type);
            }

            // Pagination
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data: notifications, error } = await query;

            if (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ error: 'Failed to fetch notifications' });
            }

            // Get unread count
            const { count: unreadCount, error: countError } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', userId)
                .eq('is_read', false)
                .eq('is_archived', false);

            if (countError) {
                console.error('Error counting unread notifications:', countError);
            }

            res.status(200).json({
                success: true,
                data: notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: notifications.length
                },
                unread_count: unreadCount || 0
            });

        } catch (error) {
            console.error('Error in getUserNotifications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Đánh dấu đã đọc
    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const { userId } = req.body; // Để verify ownership

            const { data: notification, error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId)
                .eq('recipient_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error marking notification as read:', error);
                return res.status(500).json({ error: 'Failed to mark as read' });
            }

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json({
                success: true,
                data: notification
            });

        } catch (error) {
            console.error('Error in markAsRead:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Đánh dấu tất cả đã đọc
    async markAllAsRead(req, res) {
        try {
            const { userId } = req.params;

            const { data, error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('recipient_id', userId)
                .eq('is_read', false)
                .select();

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return res.status(500).json({ error: 'Failed to mark all as read' });
            }

            res.status(200).json({
                success: true,
                message: `Marked ${data.length} notifications as read`,
                updated_count: data.length
            });

        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Xóa thông báo (archive)
    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const { userId } = req.body;

            const { data: notification, error } = await supabase
                .from('notifications')
                .update({ is_archived: true })
                .eq('id', notificationId)
                .eq('recipient_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error archiving notification:', error);
                return res.status(500).json({ error: 'Failed to delete notification' });
            }

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Notification deleted successfully'
            });

        } catch (error) {
            console.error('Error in deleteNotification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Gửi thông báo hệ thống (broadcast)
    async sendSystemNotification(req, res) {
        try {
            const {
                recipient_type, // 'candidate', 'employer', 'admin', 'all'
                title,
                message,
                type = 'system_announcement',
                data = {}
            } = req.body;

            if (!title || !message) {
                return res.status(400).json({
                    error: 'title and message are required'
                });
            }

            let recipients = [];

            // Get recipients based on type
            if (recipient_type === 'all') {
                const { data: allUsers, error } = await supabase
                    .from('users')
                    .select('id, role');
                
                if (error) throw error;
                recipients = allUsers;
            } else {
                const { data: users, error } = await supabase
                    .from('users')
                    .select('id, role')
                    .eq('role', recipient_type);
                
                if (error) throw error;
                recipients = users;
            }

            // Create notifications for all recipients
            const notifications = recipients.map(user => ({
                recipient_id: user.id,
                recipient_type: user.role,
                sender_type: 'system',
                title,
                message,
                type,
                data
            }));

            const { data: createdNotifications, error: insertError } = await supabase
                .from('notifications')
                .insert(notifications)
                .select();

            if (insertError) {
                console.error('Error creating system notifications:', insertError);
                return res.status(500).json({ error: 'Failed to send system notification' });
            }

            res.status(201).json({
                success: true,
                message: `Sent notification to ${recipients.length} users`,
                sent_count: recipients.length,
                data: createdNotifications
            });

        } catch (error) {
            console.error('Error in sendSystemNotification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new NotificationController();