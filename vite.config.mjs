import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Multi-page app configuration
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                auth: resolve(__dirname, 'auth.html'),
                teacher: resolve(__dirname, 'teacher.html'),
                profile: resolve(__dirname, 'profile.html'),
                admin: resolve(__dirname, 'admin.html'),
                studentDashboard: resolve(__dirname, 'student-dashboard.html'),
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        open: true, // Auto-open browser
    },
    // Keep legacy browser support for now
    // Can be removed once we fully migrate to ES modules
});
