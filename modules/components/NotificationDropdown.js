/**
 * NotificationDropdown - Navbar bildirim dropdown bileşeni
 * Bildirim listesi, badge ve dropdown UI
 */

const NotificationDropdown = {
    isOpen: false,
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    _unsubscribe: null,

    /**
     * Bileşeni başlat
     */
    async init() {
        // NotificationService'i dinamik import et
        const { default: NotificationService } = await import('/modules/notificationService.js');
        
        // İlk yüklemede sayıyı al
        this.unreadCount = await NotificationService.getUnreadCount();
        this.updateBadge();

        // Real-time subscription
        this._unsubscribe = NotificationService.subscribe(({ unreadCount, newNotification }) => {
            this.unreadCount = unreadCount;
            this.updateBadge();
            
            if (newNotification && this.isOpen) {
                // Açıksa listeyi yenile
                this.loadNotifications();
            }
            
            // Toast göster
            if (newNotification && window.showToast) {
                window.showToast(newNotification.title, 'info');
            }
        });

        console.log('[NotificationDropdown] Initialized');
    },

    /**
     * Temizlik
     */
    destroy() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    },

    /**
     * Bell icon + badge render
     * @returns {string} HTML
     */
    renderBellIcon() {
        return `
            <button onclick="NotificationDropdown.toggle(event)" 
                class="relative p-2.5 text-gray-500 hover:text-theme hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                title="Bildirimler"
                id="notification-bell">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <!-- Badge -->
                <span id="notification-badge" 
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ${this.unreadCount > 0 ? '' : 'hidden'}">
                    ${this.unreadCount > 9 ? '9+' : this.unreadCount}
                </span>
            </button>
        `;
    },

    /**
     * Dropdown panel render
     * @returns {string} HTML
     */
    renderDropdown() {
        return `
            <div id="notification-dropdown" 
                class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 hidden overflow-hidden">
                
                <!-- Header -->
                <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        🔔 Bildirimler
                        ${this.unreadCount > 0 ? `<span class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">${this.unreadCount}</span>` : ''}
                    </h3>
                    <div class="flex items-center gap-2">
                        ${this.unreadCount > 0 ? `
                            <button onclick="NotificationDropdown.markAllRead()" 
                                class="text-xs text-theme hover:underline">
                                Tümünü Okundu İşaretle
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Notification List -->
                <div id="notification-list" class="max-h-[400px] overflow-y-auto">
                    ${this.renderNotificationList()}
                </div>

                <!-- Footer -->
                <div class="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button onclick="NotificationDropdown.openFullPage()"
                        class="w-full py-2 text-sm text-center text-theme hover:bg-theme/10 rounded-lg transition-colors font-medium">
                        Tüm Bildirimleri Gör →
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Bildirim listesi render
     * @returns {string} HTML
     */
    renderNotificationList() {
        if (this.isLoading) {
            return `
                <div class="flex items-center justify-center py-12">
                    <div class="animate-spin w-8 h-8 border-4 border-theme border-t-transparent rounded-full"></div>
                </div>
            `;
        }

        if (!this.notifications || this.notifications.length === 0) {
            return `
                <div class="py-12 text-center">
                    <div class="text-4xl mb-3">🔔</div>
                    <p class="text-gray-500 dark:text-gray-400">Henüz bildirim yok</p>
                </div>
            `;
        }

        return this.notifications.map(notification => this.renderNotificationItem(notification)).join('');
    },

    /**
     * Tek bildirim item render
     * @param {Object} notification - Bildirim
     * @returns {string} HTML
     */
    renderNotificationItem(notification) {
        const icon = this.getIcon(notification.type);
        const colorClass = this.getColor(notification.type);
        const timeAgo = this.formatTime(notification.created_at);
        const isUnread = !notification.is_read;

        return `
            <div class="notification-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors ${isUnread ? 'bg-theme/5' : ''}"
                 onclick="NotificationDropdown.handleClick('${notification.id}', '${notification.action_url || ''}')">
                <div class="flex gap-3">
                    <!-- Icon -->
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${colorClass} bg-gray-100 dark:bg-gray-700">
                        ${icon}
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-grow min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <h4 class="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1 ${isUnread ? '' : 'font-normal'}">
                                ${notification.title}
                            </h4>
                            ${isUnread ? '<span class="w-2 h-2 bg-theme rounded-full shrink-0 mt-1.5"></span>' : ''}
                        </div>
                        ${notification.message ? `
                            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                ${notification.message}
                            </p>
                        ` : ''}
                        <p class="text-xs text-gray-400 mt-1">
                            ${timeAgo}
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Badge güncelle
     */
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    },

    /**
     * Dropdown toggle
     * @param {Event} event
     */
    async toggle(event) {
        event?.stopPropagation();
        
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;

        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            dropdown.classList.remove('hidden');
            await this.loadNotifications();
            
            // Dışarı tıklama listener'ı
            setTimeout(() => {
                document.addEventListener('click', this._outsideClickHandler);
            }, 0);
        } else {
            dropdown.classList.add('hidden');
            document.removeEventListener('click', this._outsideClickHandler);
        }
    },

    /**
     * Dışarı tıklama handler
     */
    _outsideClickHandler: (e) => {
        const dropdown = document.getElementById('notification-dropdown');
        const bell = document.getElementById('notification-bell');
        
        if (dropdown && !dropdown.contains(e.target) && bell && !bell.contains(e.target)) {
            NotificationDropdown.close();
        }
    },

    /**
     * Dropdown kapat
     */
    close() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        this.isOpen = false;
        document.removeEventListener('click', this._outsideClickHandler);
    },

    /**
     * Bildirimleri yükle
     */
    async loadNotifications() {
        this.isLoading = true;
        this.updateList();

        try {
            const { default: NotificationService } = await import('/modules/notificationService.js');
            this.notifications = await NotificationService.getNotifications({ limit: 10 });
            this.unreadCount = await NotificationService.getUnreadCount();
        } catch (error) {
            console.error('Bildirimler yüklenemedi:', error);
            this.notifications = [];
        }

        this.isLoading = false;
        this.updateList();
        this.updateBadge();
    },

    /**
     * Liste UI güncelle
     */
    updateList() {
        const list = document.getElementById('notification-list');
        if (list) {
            list.innerHTML = this.renderNotificationList();
        }
    },

    /**
     * Bildirime tıklama
     * @param {string} notificationId
     * @param {string} actionUrl
     */
    async handleClick(notificationId, actionUrl) {
        try {
            const { default: NotificationService } = await import('/modules/notificationService.js');
            await NotificationService.markAsRead(notificationId);
            
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateBadge();
        } catch (error) {
            console.error('Okundu işaretleme hatası:', error);
        }

        // Yönlendir
        if (actionUrl) {
            this.close();
            if (window.Router) {
                Router.navigate(actionUrl);
            } else if (window.Navbar) {
                Navbar.navigateSPA(actionUrl);
            }
        }
    },

    /**
     * Tümünü okundu işaretle
     */
    async markAllRead() {
        try {
            const { default: NotificationService } = await import('/modules/notificationService.js');
            await NotificationService.markAllAsRead();
            
            this.unreadCount = 0;
            this.updateBadge();
            
            // Listeyi yenile
            await this.loadNotifications();
            
            if (window.showToast) {
                window.showToast('Tüm bildirimler okundu', 'success');
            }
        } catch (error) {
            console.error('Toplu okundu işaretleme hatası:', error);
        }
    },

    /**
     * Tam sayfa görünümüne git
     */
    openFullPage() {
        this.close();
        if (window.Router) {
            Router.navigate('/notifications');
        } else if (window.Navbar) {
            Navbar.navigateSPA('/notifications');
        }
    },

    /**
     * Icon helper
     */
    getIcon(type) {
        const icons = {
            'assignment_created': '📋',
            'assignment_due_soon': '⏰',
            'assignment_due_today': '🔔',
            'assignment_overdue': '⚠️',
            'submission_received': '📥',
            'submission_graded': '✅',
            'submission_returned': '↩️',
            'course_enrolled': '📚',
            'achievement_earned': '🏆',
            'announcement': '📢',
            'system': '⚙️'
        };
        return icons[type] || '🔔';
    },

    /**
     * Color helper
     */
    getColor(type) {
        const colors = {
            'assignment_created': 'text-blue-500',
            'assignment_due_soon': 'text-orange-500',
            'assignment_due_today': 'text-red-500',
            'assignment_overdue': 'text-red-600',
            'submission_received': 'text-green-500',
            'submission_graded': 'text-emerald-500',
            'submission_returned': 'text-yellow-500',
            'course_enrolled': 'text-purple-500',
            'achievement_earned': 'text-amber-500',
            'announcement': 'text-indigo-500',
            'system': 'text-gray-500'
        };
        return colors[type] || 'text-gray-500';
    },

    /**
     * Time formatter
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
    }
};

window.NotificationDropdown = NotificationDropdown;

export default NotificationDropdown;
