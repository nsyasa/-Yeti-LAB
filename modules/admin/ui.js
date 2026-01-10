/**
 * Admin Panel UI Controller
 *
 * Sadece DOM manipülasyonu ve görsel işlerden sorumludur.
 * Business logic içermez.
 */

const AdminUI = {
    // --- Loading Overlay ---
    showLoading(message = 'Yükleniyor...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'fixed inset-0 bg-black/30 flex items-center justify-center z-[300]';
            overlay.innerHTML = `
                <div class="bg-white rounded-lg p-6 shadow-xl text-center">
                    <div class="animate-spin text-4xl mb-2">⏳</div>
                    <p id="loading-message" class="text-gray-600">${message}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            const msg = overlay.querySelector('#loading-message');
            if (msg) msg.textContent = message;
            overlay.classList.remove('hidden');
        }
    },

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    // --- Tab Management ---
    showTab(tabName) {
        const tabs = ['projects', 'components', 'phases'];

        tabs.forEach((t) => {
            const view = document.getElementById('view-' + t);
            const btn = document.getElementById('tab-' + t);

            // SPA modunda bu elementler olmayabilir
            if (!view || !btn) return;

            if (t === tabName) {
                view.classList.remove('hidden');
                view.classList.add('flex'); // Ensure flex display is active
                btn.classList.add('active', 'bg-gray-700', 'text-white'); // Add active styles
                btn.classList.remove('text-gray-300');
            } else {
                view.classList.add('hidden');
                view.classList.remove('flex'); // Remove flex to ensure hidden works
                btn.classList.remove('active', 'bg-gray-700', 'text-white');
                btn.classList.add('text-gray-300');
            }
        });
    },

    // --- Language Switching UI ---
    switchLangUI(lang) {
        // Update button styles
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            btn.classList.remove('bg-theme', 'text-white');
            btn.classList.add('text-gray-500');
        });
        const activeBtn = document.getElementById('lang-btn-' + lang);
        if (activeBtn) {
            activeBtn.classList.add('bg-theme', 'text-white');
            activeBtn.classList.remove('text-gray-500');
        }

        // Toggle field visibility
        document.querySelectorAll('.lang-field.lang-tr').forEach((el) => {
            el.classList.toggle('hidden', lang !== 'tr');
        });
        document.querySelectorAll('.lang-field.lang-en').forEach((el) => {
            el.classList.toggle('hidden', lang !== 'en');
        });
    },

    // --- Toast / Notification ---
    showToast(message, type = 'info') {
        // Basit bir toast mekanizması (Admin.js içindekini modernleştirebiliriz)
        // Şimdilik undo toast işini buraya alabiliriz ileride
    },
};

// Global erişim
window.AdminUI = AdminUI;

export default AdminUI;
