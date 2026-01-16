// vite.config.mjs
import { defineConfig } from 'file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/vite/dist/node/index.js';
import { resolve } from 'path';
import tailwindcss from 'file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/@tailwindcss/vite/dist/index.mjs';
var __vite_injected_original_dirname = 'C:\\Users\\Enes\\Documents\\-Yeti-LAB';
var vite_config_default = defineConfig({
    base: './',
    // Relative path for GitHub Pages compatibility
    plugins: [tailwindcss()],
    // Multi-page app configuration
    build: {
        rollupOptions: {
            input: {
                main: resolve(__vite_injected_original_dirname, 'index.html'),
                auth: resolve(__vite_injected_original_dirname, 'auth.html'),
            },
            output: {
                // Asset naming with hash for cache busting
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                // Define global variables for external dependencies
                globals: {
                    'chart.js': 'Chart',
                },
            },
            // External dependencies (loaded from CDN)
            // Prevent bundling if accidentally imported
            external: ['chart.js'],
        },
        outDir: 'dist',
        emptyOutDir: true,
        // Minification settings (esbuild is faster)
        minify: 'esbuild',
        // Configure esbuild specifics
        esbuild: {
            drop: [],
            // Don't drop console.log (keep for debugging)
        },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRW5lc1xcXFxEb2N1bWVudHNcXFxcLVlldGktTEFCXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFbmVzXFxcXERvY3VtZW50c1xcXFwtWWV0aS1MQUJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9FbmVzL0RvY3VtZW50cy8tWWV0aS1MQUIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBiYXNlOiAnLi8nLCAvLyBSZWxhdGl2ZSBwYXRoIGZvciBHaXRIdWIgUGFnZXMgY29tcGF0aWJpbGl0eVxyXG4gICAgcGx1Z2luczogW3RhaWx3aW5kY3NzKCldLFxyXG4gICAgLy8gTXVsdGktcGFnZSBhcHAgY29uZmlndXJhdGlvblxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgICAgICAgICBtYWluOiByZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIGF1dGg6IHJlc29sdmUoX19kaXJuYW1lLCAnYXV0aC5odG1sJyksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgICAgICAgLy8gQXNzZXQgbmFtaW5nIHdpdGggaGFzaCBmb3IgY2FjaGUgYnVzdGluZ1xyXG4gICAgICAgICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxyXG4gICAgICAgICAgICAgICAgLy8gRGVmaW5lIGdsb2JhbCB2YXJpYWJsZXMgZm9yIGV4dGVybmFsIGRlcGVuZGVuY2llc1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdjaGFydC5qcyc6ICdDaGFydCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBFeHRlcm5hbCBkZXBlbmRlbmNpZXMgKGxvYWRlZCBmcm9tIENETilcclxuICAgICAgICAgICAgLy8gUHJldmVudCBidW5kbGluZyBpZiBhY2NpZGVudGFsbHkgaW1wb3J0ZWRcclxuICAgICAgICAgICAgZXh0ZXJuYWw6IFsnY2hhcnQuanMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICAgIC8vIE1pbmlmaWNhdGlvbiBzZXR0aW5ncyAoZXNidWlsZCBpcyBmYXN0ZXIpXHJcbiAgICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXHJcbiAgICAgICAgLy8gQ29uZmlndXJlIGVzYnVpbGQgc3BlY2lmaWNzXHJcbiAgICAgICAgZXNidWlsZDoge1xyXG4gICAgICAgICAgICBkcm9wOiBbXSwgLy8gRG9uJ3QgZHJvcCBjb25zb2xlLmxvZyAoa2VlcCBmb3IgZGVidWdnaW5nKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gU291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZyAoZGlzYWJsZSBpbiBwcm9kdWN0aW9uIGlmIG5lZWRlZClcclxuICAgICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnNcclxuICAgICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgfSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICAgIHBvcnQ6IDMwMDAsXHJcbiAgICAgICAgb3BlbjogdHJ1ZSwgLy8gQXV0by1vcGVuIGJyb3dzZXJcclxuICAgIH0sXHJcbiAgICAvLyBEZWZpbmUgZ2xvYmFsIGNvbnN0YW50c1xyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICAgX19ERVZfXzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyksXHJcbiAgICB9LFxyXG4gICAgLy8gUmVzb2x2ZSBhbGlhc2VzIChvcHRpb25hbCwgZm9yIGNsZWFuZXIgaW1wb3J0cylcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcbiAgICAgICAgICAgICdAbW9kdWxlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnbW9kdWxlcycpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpUyxTQUFTLG9CQUFvQjtBQUM5VCxTQUFTLGVBQWU7QUFDeEIsT0FBTyxpQkFBaUI7QUFGeEIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsTUFBTTtBQUFBO0FBQUEsRUFDTixTQUFTLENBQUMsWUFBWSxDQUFDO0FBQUE7QUFBQSxFQUV2QixPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDSCxNQUFNLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3JDLE1BQU0sUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDeEM7QUFBQSxNQUNBLFFBQVE7QUFBQTtBQUFBLFFBRUosZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUE7QUFBQSxRQUVoQixTQUFTO0FBQUEsVUFDTCxZQUFZO0FBQUEsUUFDaEI7QUFBQSxNQUNKO0FBQUE7QUFBQTtBQUFBLE1BR0EsVUFBVSxDQUFDLFVBQVU7QUFBQSxJQUN6QjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBO0FBQUEsSUFFYixRQUFRO0FBQUE7QUFBQSxJQUVSLFNBQVM7QUFBQSxNQUNMLE1BQU0sQ0FBQztBQUFBO0FBQUEsSUFDWDtBQUFBO0FBQUEsSUFFQSxXQUFXO0FBQUE7QUFBQSxJQUVYLFFBQVE7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxFQUNWO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNKLFNBQVMsS0FBSyxVQUFVLFFBQVEsSUFBSSxhQUFhLFlBQVk7QUFBQSxFQUNqRTtBQUFBO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQzdCLFlBQVksUUFBUSxrQ0FBVyxTQUFTO0FBQUEsSUFDNUM7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
