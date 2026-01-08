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
// These are loaded by ViewLoader but need to be in bundle
// ==========================================

// Admin View & Modules
import '../constants/elements.js';
import '../modules/admin/storage.js';
import '../modules/admin/courses.js';
import '../modules/admin/phases.js';
import '../modules/admin/components.js';
import '../modules/admin/projects.js';
import '../modules/admin/settings.js';
import '../modules/admin/supabase-sync.js';
import '../modules/admin/hotspots.js';
import '../modules/admin/images.js';
import '../modules/admin/quizzes.js';
import '../modules/admin.js';
import '../views/admin/AdminLayout.js';
import '../views/admin/sections/ProjectsSection.js';
import '../views/admin/sections/PhasesSection.js';
import '../views/admin/sections/ComponentsSection.js';
import '../views/admin/modals/AdminModals.js';
import '../views/admin/AdminView.js';

// Teacher View & Modules
import '../modules/teacher/analytics.js';
import '../modules/teacher/classrooms.js';
import '../modules/teacher/students.js';
import '../modules/teacher-manager.js';
import '../views/teacher/TeacherLayout.js';
import '../views/teacher/sections/DashboardSection.js';
import '../views/teacher/sections/ClassroomsSection.js';
import '../views/teacher/sections/StudentsSection.js';
import '../views/teacher/modals/TeacherModals.js';
import '../views/teacher/TeacherView.js';

// Profile View & Modules
import '../data/cities.js';
import '../views/profile/ProfileView.js';

// Student Dashboard View
import '../views/student/StudentDashboardView.js';

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
