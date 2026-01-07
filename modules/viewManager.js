/**
 * ViewManager - Merkezi View Lifecycle Yönetimi
 * SPA geçişlerinde view mount/unmount işlemlerini kontrol eder
 *
 * Kullanım:
 *   ViewManager.init('main-content');
 *   ViewManager.mount(AdminView, { route: routeInfo });
 *   ViewManager.unmountCurrent();
 */

const ViewManager = {
    // Şu an aktif olan view
    currentView: null,

    // Ana container element
    container: null,

    // Debug modu
    debug: true,

    /**
     * ViewManager'ı başlat
     * @param {string} containerId - Ana content container'ın ID'si
     */
    init(containerId = 'main-content') {
        this.container = document.getElementById(containerId);

        if (!this.container) {
            console.warn(`[ViewManager] Container '${containerId}' bulunamadı`);
        }

        if (this.debug) {
            console.log('🎬 ViewManager initialized', { containerId });
        }
    },

    /**
     * Yeni bir view'ı monte et
     * Önce mevcut view'ı unmount eder
     * @param {Object} View - Mount edilecek view objesi (mount/unmount metodları olmalı)
     * @param {Object} options - View'a geçirilecek opsiyonlar
     */
    async mount(View, options = {}) {
        if (!View) {
            console.error('[ViewManager] mount() çağrıldı ama View null/undefined');
            return;
        }

        const viewName = View.name || View.constructor?.name || 'UnknownView';

        // Mevcut view'ı unmount et
        if (this.currentView && this.currentView !== View) {
            await this.unmountCurrent();
        }

        // Yeni view'ı kaydet
        this.currentView = View;

        // View'ı monte et
        if (typeof View.mount === 'function') {
            try {
                await View.mount(this.container, options);

                if (this.debug) {
                    console.log(`✅ [ViewManager] Mounted: ${viewName}`, options);
                }
            } catch (error) {
                console.error(`[ViewManager] Mount hatası (${viewName}):`, error);
            }
        } else {
            console.warn(`[ViewManager] ${viewName} view'ında mount() metodu yok`);
        }
    },

    /**
     * Mevcut view'ı unmount et
     */
    async unmountCurrent() {
        if (!this.currentView) {
            return;
        }

        const viewName = this.currentView.name || 'CurrentView';

        if (typeof this.currentView.unmount === 'function') {
            try {
                await this.currentView.unmount();

                if (this.debug) {
                    console.log(`🔄 [ViewManager] Unmounted: ${viewName}`);
                }
            } catch (error) {
                console.error(`[ViewManager] Unmount hatası (${viewName}):`, error);
            }
        }

        this.currentView = null;
    },

    /**
     * Şu an aktif view'ı döndür
     * @returns {Object|null}
     */
    getCurrentView() {
        return this.currentView;
    },

    /**
     * Belirli bir view aktif mi kontrol et
     * @param {Object} View - Kontrol edilecek view
     * @returns {boolean}
     */
    isActive(View) {
        return this.currentView === View;
    },

    /**
     * Debug modunu aç/kapa
     * @param {boolean} enabled
     */
    setDebug(enabled) {
        this.debug = enabled;
    },
};

// Global olarak erişilebilir yap
window.ViewManager = ViewManager;
