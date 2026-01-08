import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: '/-Yeti-LAB/', // GitHub Pages base path
    plugins: [tailwindcss()],
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
            output: {
                // Asset naming with hash for cache busting
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
            // External dependencies (loaded from CDN)
            external: [],
        },
        outDir: 'dist',
        emptyOutDir: true,
        // Minification settings
        minify: 'esbuild',
        // Source maps for debugging (disable in production if needed)
        sourcemap: false,
        // Target modern browsers
        target: 'es2020',
    },
    server: {
        port: 3000,
        open: true, // Auto-open browser
    },
    // Define global constants
    define: {
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    },
    // Resolve aliases (optional, for cleaner imports)
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@modules': resolve(__dirname, 'modules'),
        },
    },
});
