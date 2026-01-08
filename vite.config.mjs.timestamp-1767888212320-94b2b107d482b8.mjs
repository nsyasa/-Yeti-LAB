// vite.config.mjs
import { resolve } from 'path';
import tailwindcss from 'file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/@tailwindcss/vite/dist/index.mjs';
var __vite_injected_original_dirname = 'C:\\Users\\Enes\\Documents\\-Yeti-LAB';
var vite_config_default = defineConfig({
    base: '/-Yeti-LAB/',
    // GitHub Pages base path
    plugins: [tailwindcss()],
    // Multi-page app configuration
    build: {
        rollupOptions: {
            input: {
                main: resolve(__vite_injected_original_dirname, 'index.html'),
                auth: resolve(__vite_injected_original_dirname, 'auth.html'),
                teacher: resolve(__vite_injected_original_dirname, 'teacher.html'),
                profile: resolve(__vite_injected_original_dirname, 'profile.html'),
                admin: resolve(__vite_injected_original_dirname, 'admin.html'),
                studentDashboard: resolve(__vite_injected_original_dirname, 'student-dashboard.html'),
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
        port: 3e3,
        open: true,
        // Auto-open browser
    },
    // Define global constants
    define: {
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    },
    // Resolve aliases (optional, for cleaner imports)
    resolve: {
        alias: {
            '@': resolve(__vite_injected_original_dirname, 'src'),
            '@modules': resolve(__vite_injected_original_dirname, 'modules'),
        },
    },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRW5lc1xcXFxEb2N1bWVudHNcXFxcLVlldGktTEFCXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFbmVzXFxcXERvY3VtZW50c1xcXFwtWWV0aS1MQUJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9FbmVzL0RvY3VtZW50cy8tWWV0aS1MQUIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIGJhc2U6ICcvLVlldGktTEFCLycsIC8vIEdpdEh1YiBQYWdlcyBiYXNlIHBhdGhcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICB0YWlsd2luZGNzcygpLFxyXG4gICAgXSxcclxuICAgIC8vIE11bHRpLXBhZ2UgYXBwIGNvbmZpZ3VyYXRpb25cclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBpbnB1dDoge1xyXG4gICAgICAgICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXHJcbiAgICAgICAgICAgICAgICBhdXRoOiByZXNvbHZlKF9fZGlybmFtZSwgJ2F1dGguaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgdGVhY2hlcjogcmVzb2x2ZShfX2Rpcm5hbWUsICd0ZWFjaGVyLmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIHByb2ZpbGU6IHJlc29sdmUoX19kaXJuYW1lLCAncHJvZmlsZS5odG1sJyksXHJcbiAgICAgICAgICAgICAgICBhZG1pbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdhZG1pbi5odG1sJyksXHJcbiAgICAgICAgICAgICAgICBzdHVkZW50RGFzaGJvYXJkOiByZXNvbHZlKF9fZGlybmFtZSwgJ3N0dWRlbnQtZGFzaGJvYXJkLmh0bWwnKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3NldCBuYW1pbmcgd2l0aCBoYXNoIGZvciBjYWNoZSBidXN0aW5nXHJcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIEV4dGVybmFsIGRlcGVuZGVuY2llcyAobG9hZGVkIGZyb20gQ0ROKVxyXG4gICAgICAgICAgICBleHRlcm5hbDogW10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgICAgICAvLyBNaW5pZmljYXRpb24gc2V0dGluZ3NcclxuICAgICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcclxuICAgICAgICAvLyBTb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nIChkaXNhYmxlIGluIHByb2R1Y3Rpb24gaWYgbmVlZGVkKVxyXG4gICAgICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2Vyc1xyXG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgICBvcGVuOiB0cnVlLCAvLyBBdXRvLW9wZW4gYnJvd3NlclxyXG4gICAgfSxcclxuICAgIC8vIERlZmluZSBnbG9iYWwgY29uc3RhbnRzXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgICBfX0RFVl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSxcclxuICAgIH0sXHJcbiAgICAvLyBSZXNvbHZlIGFsaWFzZXMgKG9wdGlvbmFsLCBmb3IgY2xlYW5lciBpbXBvcnRzKVxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgICAgICAgJ0Btb2R1bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdtb2R1bGVzJyksXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLFNBQVMsZUFBZTtBQUN6VCxPQUFPLGlCQUFpQjtBQUR4QixJQUFNLG1DQUFtQztBQUd6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNMLFlBQVk7QUFBQSxFQUNoQjtBQUFBO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDSCxNQUFNLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3JDLE1BQU0sUUFBUSxrQ0FBVyxXQUFXO0FBQUEsUUFDcEMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUMxQyxTQUFTLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQzFDLE9BQU8sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDdEMsa0JBQWtCLFFBQVEsa0NBQVcsd0JBQXdCO0FBQUEsTUFDakU7QUFBQSxNQUNBLFFBQVE7QUFBQTtBQUFBLFFBRUosZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDcEI7QUFBQTtBQUFBLE1BRUEsVUFBVSxDQUFDO0FBQUEsSUFDZjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBO0FBQUEsSUFFYixRQUFRO0FBQUE7QUFBQSxJQUVSLFdBQVc7QUFBQTtBQUFBLElBRVgsUUFBUTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLEVBQ1Y7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ0osU0FBUyxLQUFLLFVBQVUsUUFBUSxJQUFJLGFBQWEsWUFBWTtBQUFBLEVBQ2pFO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDN0IsWUFBWSxRQUFRLGtDQUFXLFNBQVM7QUFBQSxJQUM1QztBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
