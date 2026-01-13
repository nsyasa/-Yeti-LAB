/**
 * Storage Manager Module for Admin Panel
 * Handles localStorage operations for autosave and data persistence.
 *
 * Features:
 * - Debounced autosave (2s delay)
 * - Safe localStorage with try-catch
 * - Status UI updates
 */

const StorageManager = {
    // Configuration
    config: {
        storageKey: 'mucit_atolyesi_autosave',
        debounceMs: 2000,
        statusElementId: 'autosave-status',
        getData: () => null, // Function to get data to save
        setData: (data) => {}, // Function to restore data
    },

    // State
    autoSaveTimer: null,

    /**
     * Initialize with configuration
     */
    init(config) {
        this.config = { ...this.config, ...config };
    },

    /**
     * Trigger autosave with debounce
     */
    triggerAutoSave() {
        // UX FIX: Use 'Taslak Güncellendi' for local save (orange) to distinguish from cloud save (green)
        this.updateStatus('📝 Taslak Güncellendi', 'orange');

        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => this.saveToLocal(), this.config.debounceMs);
    },

    /**
     * Save data to localStorage
     */
    saveToLocal() {
        try {
            const data = this.config.getData();
            if (!data) {
                console.warn('StorageManager: No data to save');
                return false;
            }

            const dataToSave = {
                timestamp: new Date().getTime(),
                data: data,
            };

            localStorage.setItem(this.config.storageKey, JSON.stringify(dataToSave));

            const timeStr = new Date().toLocaleTimeString();
            // UX FIX: Clarify this is local draft, use gray/neutral color
            this.updateStatus(`📋 Yerel Taslak: ${timeStr}`, 'gray');
            return true;
        } catch (e) {
            console.error('StorageManager: AutoSave Error:', e);

            // Check if quota exceeded
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                this.updateStatus('Depolama dolu! Eski verileri temizleyin.', 'red');
            } else {
                this.updateStatus('Otomatik kayıt hatası!', 'red');
            }
            return false;
        }
    },

    /**
     * Restore data from localStorage
     * @returns {boolean} True if data was restored
     */
    restoreFromLocal() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (!saved) return false;

            const parsed = JSON.parse(saved);

            if (parsed.data && Object.keys(parsed.data).length > 0) {
                this.config.setData(parsed.data);

                const date = new Date(parsed.timestamp).toLocaleString();

                // Delayed UI update to ensure element exists
                setTimeout(() => {
                    this.updateStatus(`Yüklendi: ${date}`, 'blue');
                }, 500);

                return true;
            }
            return false;
        } catch (e) {
            console.error('StorageManager: Restore Error:', e);
            return false;
        }
    },

    /**
     * Clear saved data
     */
    clear() {
        try {
            localStorage.removeItem(this.config.storageKey);
            this.updateStatus('', 'gray');
            return true;
        } catch (e) {
            console.error('StorageManager: Clear Error:', e);
            return false;
        }
    },

    /**
     * Check if saved data exists
     */
    hasSavedData() {
        try {
            return localStorage.getItem(this.config.storageKey) !== null;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get storage usage info
     */
    getStorageInfo() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (!saved) return null;

            const parsed = JSON.parse(saved);
            return {
                timestamp: new Date(parsed.timestamp),
                sizeBytes: saved.length,
                sizeKB: Math.round(saved.length / 1024),
            };
        } catch (e) {
            return null;
        }
    },

    /**
     * Update status element UI
     * @private
     */
    updateStatus(message, color) {
        const statusEl = document.getElementById(this.config.statusElementId);
        if (!statusEl) return;

        statusEl.textContent = message;

        // Remove all color classes
        statusEl.classList.remove(
            'text-green-400',
            'text-red-400',
            'text-blue-400',
            'text-yellow-400',
            'text-orange-400',
            'text-gray-400'
        );

        // Add new color class
        if (color) {
            statusEl.classList.add(`text-${color}-400`);
        }
    },
};

window.StorageManager = StorageManager;
