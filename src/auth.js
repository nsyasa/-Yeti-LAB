/**
 * Auth Page Entry Point
 * Only imports necessary modules for the authentication page
 */

// Styles
import './style.css';

// Core Utils
import '../modules/utils.js';
import '../modules/validators.js';
import '../modules/constants.js';

// Core Modules
import '../modules/themes.js';
import '../modules/themeManager.js';
import '../modules/toast.js';
import '../modules/badges.js';
import '../modules/core/localStorage.js';
import '../modules/store/store.js';

// Auth & Supabase
import SupabaseClient from '../modules/supabaseClient.js';
import Auth from '../modules/auth.js';
import '../modules/router.js'; // Router is needed for redirection

// Make SupabaseClient and Auth globally available for auth.html inline scripts
window.SupabaseClient = SupabaseClient;
window.Auth = Auth;

// Export for debugging
if (import.meta.env.DEV) {
    console.log('🔐 Auth modules loaded via Vite');
}
