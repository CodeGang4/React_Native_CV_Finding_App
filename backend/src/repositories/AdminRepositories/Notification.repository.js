const supabase = require('../../supabase/config');

class NotificationRepository {
    /**
     * Create notification
     */
    static async createNotification(notificationData) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notificationData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in createNotification:', error);
            throw error;
        }
    }

    /**
     * Get user notifications
     */
    static async getUserNotifications(userId, filters = {}) {
        try {
            const { page = 1, limit = 20, unread_only = false, type } = filters;

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

            if (unread_only) {
                query = query.eq('is_read', false);
            }

            if (type) {
                query = query.eq('type', type);
            }

            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getUserNotifications:', error);
            throw error;
        }
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId) {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', userId)
                .eq('is_read', false)
                .eq('is_archived', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId)
                .eq('recipient_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in markAsRead:', error);
            throw error;
        }
    }

    /**
     * Mark all as read
     */
    static async markAllAsRead(userId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('recipient_id', userId)
                .eq('is_read', false)
                .select();

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            throw error;
        }
    }

    /**
     * Archive notification (soft delete)
     */
    static async archiveNotification(notificationId, userId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_archived: true })
                .eq('id', notificationId)
                .eq('recipient_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in archiveNotification:', error);
            throw error;
        }
    }

    /**
     * Get users by role
     */
    static async getUsersByRole(role) {
        try {
            let query = supabase
                .from('users')
                .select('id, role');

            if (role && role !== 'all') {
                query = query.eq('role', role);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in getUsersByRole:', error);
            throw error;
        }
    }

    /**
     * Bulk create notifications (for broadcasts)
     */
    static async bulkCreateNotifications(notificationsArray) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notificationsArray)
                .select();

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error in bulkCreateNotifications:', error);
            throw error;
        }
    }

    /**
     * Get notification by ID
     */
    static async getNotificationById(notificationId) {
        try {
            const { data, error } = await supabase
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
                .eq('id', notificationId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in getNotificationById:', error);
            throw error;
        }
    }
}

module.exports = NotificationRepository;
