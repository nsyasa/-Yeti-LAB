/**
 * Main Entry Point for Yeti LAB
 *
 * Bu dosya Vite tarafından bundle edilir ve tüm modülleri tek dosyada birleştirir.
 * Global namespace korunur (window.X = X pattern'i devam eder).
 *
 * Yükleme sırası önemli! Bağımlılıklar önce yüklenir.
 */

// ==========================================
// PHASE 0: Styles
// ==========================================
// 1. Tailwind (Base + Components + Utilities)
import './style.css';

// 2. Core Styles (Overrides & Custom)
import '../styles/tokens.css';
import '../styles/components.css';
import '../styles/main.css';

// 3. Panel Styles
import '../styles/teacher.css';
import '../styles/admin.css';
import '../styles/profile.css';
import '../styles/student.css';

// ==========================================
// PHASE 1: Core Utilities (No dependencies)
// ==========================================
import '../modules/utils.js';
import '../modules/validators.js';
import '../modules/constants.js';

// ==========================================
// PHASE 2: Data Layer
// ==========================================
import '../data/base.js';
import '../data/tips.js';
import '../data/quiz.js';

// ==========================================
// PHASE 3: Core Modules (Minimal dependencies)
// ==========================================
import '../modules/settings.js';
import '../modules/i18n.js';
import '../config/tabs.js';
import '../modules/themes.js';
import '../modules/themeManager.js';
import '../modules/toast.js';
import '../modules/badges.js';

// ==========================================
// PHASE 4: State Management
// ==========================================
import '../modules/core/localStorage.js';
import '../modules/core/stateProxy.js';
import '../modules/store/store.js';
import '../modules/cache.js';
import '../modules/metrics.js';
import '../modules/api.js';
import '../modules/core/services.js'; // Services Wrapper (Step 1)

// ==========================================
// PHASE 5: Supabase & Auth
// ==========================================
import '../modules/supabaseClient.js';
import '../modules/auth.js';
import '../modules/authUI.js';

// ==========================================
// PHASE 6: Course & Progress
// ==========================================
import '../modules/courseLoader.js';
import '../modules/progress.js';

// ==========================================
// PHASE 7: UI Components
// ==========================================
import '../modules/ui.js';
import '../modules/search.js';
import '../modules/scrollManager.js';
import '../modules/components/Navbar.js';
import '../modules/components/Footer.js';
import '../modules/layout/MainLayout.js';

// ==========================================
// PHASE 8: Routing (SPA)
// ==========================================
import '../modules/router.js';
import '../modules/viewManager.js';
import '../modules/routing/viewLoader.js';

// ==========================================
// PHASE 9: Simulations
// ==========================================
import '../modules/simulation/simController.js';
import '../modules/simulations.js';

// ==========================================
// PHASE 10: Assistant
// ==========================================
import '../modules/assistant.js';

// ==========================================
// PHASE 11: View Scripts (SPA Lazy Views)
// ==========================================
// REMOVED: These are now lazy loaded via ViewLoader (modules/routing/viewLoader.js)
// - Admin View & Modules
// - Teacher View & Modules
// - Profile View & Modules
// - Student Dashboard View

// ==========================================
// PHASE 12: Main Application
// ==========================================
import '../app.js';

// ==========================================
// Export for debugging (optional)
// ==========================================
if (import.meta.env.DEV) {
    console.log('🚀 Yeti LAB modules loaded via Vite');
    console.log('📦 Available globals:', {
        app: typeof app !== 'undefined',
        UI: typeof UI !== 'undefined',
        Store: typeof Store !== 'undefined',
        Router: typeof Router !== 'undefined',
        Auth: typeof Auth !== 'undefined',
    });
}
