/**
 * NotificationService - Uygulama içi bildirim yönetimi
 * Supabase notifications tablosu ile entegre
 * Real-time subscription desteği
 */

import SupabaseClient from './supabaseClient.js';

// Lazy getter - her çağrıda client'a erişir
const getSupabase = () => SupabaseClient.getClient();

const NotificationService = {
    // Real-time subscription reference
    _subscription: null,
    _listeners: new Set(),
    _unreadCount: 0,

    /**
     * Bildirimleri getir (sayfalı)
     * @param {Object} options - Seçenekler
     * @param {number} options.limit - Limit (default: 20)
     * @param {number} options.offset - Offset (default: 0)
     * @param {boolean} options.unreadOnly - Sadece okunmamışlar (default: false)
     * @returns {Promise<Array>}
     */
    async getNotifications({ limit = 20, offset = 0, unreadOnly = false } = {}) {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        // Kullanıcının student mi user mi olduğunu belirle
        const { recipientField, recipientId } = await this._getRecipientInfo(user.id);
        if (!recipientField) return [];

        let query = supabase
            .from('notifications')
            .select('*')
            .eq(recipientField, recipientId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Bildirimler yüklenemedi:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Okunmamış bildirim sayısını getir
     * @returns {Promise<number>}
     */
    async getUnreadCount() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return 0;

        const { recipientField, recipientId } = await this._getRecipientInfo(user.id);
        if (!recipientField) return 0;

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq(recipientField, recipientId)
            .eq('is_read', false);

        if (error) {
            console.error('Okunmamış sayısı alınamadı:', error);
            return 0;
        }

        this._unreadCount = count || 0;
        return this._unreadCount;
    },

    /**
     * Bildirimi okundu olarak işaretle
     * @param {string} notificationId - Bildirim ID
     * @returns {Promise<Object>}
     */
    async markAsRead(notificationId) {
        const { data, error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .eq('id', notificationId)
            .select()
            .single();

        if (error) {
            console.error('Okundu işaretleme hatası:', error);
            throw error;
        }

        // Sayacı güncelle
        await this.getUnreadCount();
        this._notifyListeners();

        return data;
    },

    /**
     * Tüm bildirimleri okundu olarak işaretle
     * @returns {Promise<void>}
     */
    async markAllAsRead() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return;

        const { recipientField, recipientId } = await this._getRecipientInfo(user.id);
        if (!recipientField) return;

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .eq(recipientField, recipientId)
            .eq('is_read', false);

        if (error) {
            console.error('Toplu okundu işaretleme hatası:', error);
            throw error;
        }

        this._unreadCount = 0;
        this._notifyListeners();
    },

    /**
     * Bildirimi sil
     * @param {string} notificationId - Bildirim ID
     * @returns {Promise<void>}
     */
    async deleteNotification(notificationId) {
        const { error } = await getSupabase().from('notifications').delete().eq('id', notificationId);

        if (error) {
            console.error('Bildirim silme hatası:', error);
            throw error;
        }

        await this.getUnreadCount();
        this._notifyListeners();
    },

    /**
     * Tüm bildirimleri temizle
     * @returns {Promise<void>}
     */
    async clearAll() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return;

        const { recipientField, recipientId } = await this._getRecipientInfo(user.id);
        if (!recipientField) return;

        const { error } = await getSupabase().from('notifications').delete().eq(recipientField, recipientId);

        if (error) {
            console.error('Tüm bildirimleri silme hatası:', error);
            throw error;
        }

        this._unreadCount = 0;
        this._notifyListeners();
    },

    /**
     * Real-time subscription başlat
     * @param {Function} callback - Yeni bildirim geldiğinde çağrılacak fonksiyon
     * @returns {Function} Unsubscribe fonksiyonu
     */
    subscribe(callback) {
        this._listeners.add(callback);

        // İlk subscription'ı başlat
        if (!this._subscription) {
            this._startRealtimeSubscription();
        }

        // Unsubscribe fonksiyonu döndür
        return () => {
            this._listeners.delete(callback);
            if (this._listeners.size === 0) {
                this._stopRealtimeSubscription();
            }
        };
    },

    /**
     * Real-time subscription başlat
     * @private
     */
    async _startRealtimeSubscription() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return;

        const { recipientField, recipientId } = await this._getRecipientInfo(user.id);
        if (!recipientField) return;

        // Channel oluştur
        this._subscription = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `${recipientField}=eq.${recipientId}`,
                },
                (payload) => {
                    console.log('[NotificationService] Yeni bildirim:', payload.new);
                    this._unreadCount++;
                    this._notifyListeners(payload.new);

                    // Browser notification göster (izin varsa)
                    this._showBrowserNotification(payload.new);
                }
            )
            .subscribe((status) => {
                console.log('[NotificationService] Subscription status:', status);
            });
    },

    /**
     * Real-time subscription durdur
     * @private
     */
    _stopRealtimeSubscription() {
        if (this._subscription) {
            getSupabase().removeChannel(this._subscription);
            this._subscription = null;
        }
    },

    /**
     * Dinleyicileri bilgilendir
     * @param {Object} newNotification - Yeni bildirim (opsiyonel)
     * @private
     */
    _notifyListeners(newNotification = null) {
        this._listeners.forEach((callback) => {
            try {
                callback({
                    unreadCount: this._unreadCount,
                    newNotification,
                });
            } catch (error) {
                console.error('Listener hatası:', error);
            }
        });
    },

    /**
     * Browser notification göster
     * @param {Object} notification - Bildirim
     * @private
     */
    _showBrowserNotification(notification) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message || '',
                icon: '/img/logo.svg',
                tag: notification.id,
            });
        }
    },

    /**
     * Browser notification izni iste
     * @returns {Promise<string>} - 'granted', 'denied', veya 'default'
     */
    async requestPermission() {
        if (!('Notification' in window)) return 'denied';

        if (Notification.permission === 'default') {
            return await Notification.requestPermission();
        }

        return Notification.permission;
    },

    /**
     * Kullanıcının recipient bilgilerini belirle
     * @param {string} userId - Auth user ID
     * @returns {Promise<{recipientField: string, recipientId: string}>}
     * @private
     */
    async _getRecipientInfo(userId) {
        // Önce user_profiles'da kontrol et (öğretmen/admin)
        const { data: profile } = await getSupabase().from('user_profiles').select('id').eq('id', userId).single();

        if (profile) {
            return { recipientField: 'recipient_user_id', recipientId: profile.id };
        }

        // students tablosunda kontrol et
        const { data: student } = await getSupabase().from('students').select('id').eq('user_id', userId).single();

        if (student) {
            return { recipientField: 'recipient_student_id', recipientId: student.id };
        }

        return { recipientField: null, recipientId: null };
    },

    /**
     * Bildirim tipine göre ikon getir
     * @param {string} type - Bildirim tipi
     * @returns {string} - Emoji ikon
     */
    getIcon(type) {
        const icons = {
            assignment_created: '📋',
            assignment_due_soon: '⏰',
            assignment_due_today: '🔔',
            assignment_overdue: '⚠️',
            submission_received: '📥',
            submission_graded: '✅',
            submission_returned: '↩️',
            course_enrolled: '📚',
            achievement_earned: '🏆',
            announcement: '📢',
            system: '⚙️',
        };
        return icons[type] || '🔔';
    },

    /**
     * Bildirim tipine göre renk getir
     * @param {string} type - Bildirim tipi
     * @returns {string} - Tailwind renk class'ı
     */
    getColor(type) {
        const colors = {
            assignment_created: 'text-blue-500',
            assignment_due_soon: 'text-orange-500',
            assignment_due_today: 'text-red-500',
            assignment_overdue: 'text-red-600',
            submission_received: 'text-green-500',
            submission_graded: 'text-emerald-500',
            submission_returned: 'text-yellow-500',
            course_enrolled: 'text-purple-500',
            achievement_earned: 'text-amber-500',
            announcement: 'text-indigo-500',
            system: 'text-gray-500',
        };
        return colors[type] || 'text-gray-500';
    },

    /**
     * Zamanı formatla (relative)
     * @param {string} dateString - ISO date string
     * @returns {string}
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR');
    },

    /**
     * Mevcut okunmamış sayısını getir (cache'den)
     * @returns {number}
     */
    getCachedUnreadCount() {
        return this._unreadCount;
    },

    /**
     * Servisi başlat - Auth değişikliklerini dinle
     */
    init() {
        // Auth state değişikliğinde subscription'ı yenile
        getSupabase().auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this._startRealtimeSubscription();
                this.getUnreadCount();
            } else if (event === 'SIGNED_OUT') {
                this._stopRealtimeSubscription();
                this._unreadCount = 0;
            }
        });

        // İlk yüklemede sayıyı al
        this.getUnreadCount();
    },
};

export default NotificationService;
