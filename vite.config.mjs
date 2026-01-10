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
            },
            output: {
                // Asset naming with hash for cache busting
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                // Define global variables for external dependencies
                globals: {
                    '@supabase/supabase-js': 'supabase', // Global variable name from CDN
                    'chart.js': 'Chart',
                },
            },
            // External dependencies (loaded from CDN)
            // Prevent bundling if accidentally imported
            external: ['@supabase/supabase-js', 'chart.js'],
        },
        outDir: 'dist',
        emptyOutDir: true,
        // Minification settings (esbuild is faster)
        minify: 'esbuild',
        // Configure esbuild specifics
        esbuild: {
            drop: [], // Don't drop console.log (keep for debugging)
        },
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
