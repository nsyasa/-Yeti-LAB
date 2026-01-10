// vite.config.mjs
import { defineConfig } from 'file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/vite/dist/node/index.js';
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
            },
            output: {
                // Asset naming with hash for cache busting
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                // Define global variables for external dependencies
                globals: {
                    '@supabase/supabase-js': 'supabase',
                    // Global variable name from CDN
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRW5lc1xcXFxEb2N1bWVudHNcXFxcLVlldGktTEFCXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFbmVzXFxcXERvY3VtZW50c1xcXFwtWWV0aS1MQUJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9FbmVzL0RvY3VtZW50cy8tWWV0aS1MQUIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBiYXNlOiAnLy1ZZXRpLUxBQi8nLCAvLyBHaXRIdWIgUGFnZXMgYmFzZSBwYXRoXHJcbiAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV0sXHJcbiAgICAvLyBNdWx0aS1wYWdlIGFwcCBjb25maWd1cmF0aW9uXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgYXV0aDogcmVzb2x2ZShfX2Rpcm5hbWUsICdhdXRoLmh0bWwnKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3NldCBuYW1pbmcgd2l0aCBoYXNoIGZvciBjYWNoZSBidXN0aW5nXHJcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXHJcbiAgICAgICAgICAgICAgICAvLyBEZWZpbmUgZ2xvYmFsIHZhcmlhYmxlcyBmb3IgZXh0ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyc6ICdzdXBhYmFzZScsIC8vIEdsb2JhbCB2YXJpYWJsZSBuYW1lIGZyb20gQ0ROXHJcbiAgICAgICAgICAgICAgICAgICAgJ2NoYXJ0LmpzJzogJ0NoYXJ0J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBFeHRlcm5hbCBkZXBlbmRlbmNpZXMgKGxvYWRlZCBmcm9tIENETilcclxuICAgICAgICAgICAgLy8gUHJldmVudCBidW5kbGluZyBpZiBhY2NpZGVudGFsbHkgaW1wb3J0ZWRcclxuICAgICAgICAgICAgZXh0ZXJuYWw6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJywgJ2NoYXJ0LmpzJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgICAgICAvLyBNaW5pZmljYXRpb24gc2V0dGluZ3MgKGVzYnVpbGQgaXMgZmFzdGVyKVxyXG4gICAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgICAgIC8vIENvbmZpZ3VyZSBlc2J1aWxkIHNwZWNpZmljc1xyXG4gICAgICAgIGVzYnVpbGQ6IHtcclxuICAgICAgICAgICAgZHJvcDogW10sIC8vIERvbid0IGRyb3AgY29uc29sZS5sb2cgKGtlZXAgZm9yIGRlYnVnZ2luZylcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIFNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmcgKGRpc2FibGUgaW4gcHJvZHVjdGlvbiBpZiBuZWVkZWQpXHJcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzXHJcbiAgICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBwb3J0OiAzMDAwLFxyXG4gICAgICAgIG9wZW46IHRydWUsIC8vIEF1dG8tb3BlbiBicm93c2VyXHJcbiAgICB9LFxyXG4gICAgLy8gRGVmaW5lIGdsb2JhbCBjb25zdGFudHNcclxuICAgIGRlZmluZToge1xyXG4gICAgICAgIF9fREVWX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpLFxyXG4gICAgfSxcclxuICAgIC8vIFJlc29sdmUgYWxpYXNlcyAob3B0aW9uYWwsIGZvciBjbGVhbmVyIGltcG9ydHMpXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICAgICAgICAnQG1vZHVsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ21vZHVsZXMnKSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVMsU0FBUyxvQkFBb0I7QUFDOVQsU0FBUyxlQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBRnhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLE1BQU07QUFBQTtBQUFBLEVBQ04sU0FBUyxDQUFDLFlBQVksQ0FBQztBQUFBO0FBQUEsRUFFdkIsT0FBTztBQUFBLElBQ0gsZUFBZTtBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0gsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUNyQyxNQUFNLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQ3hDO0FBQUEsTUFDQSxRQUFRO0FBQUE7QUFBQSxRQUVKLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBO0FBQUEsUUFFaEIsU0FBUztBQUFBLFVBQ0wseUJBQXlCO0FBQUE7QUFBQSxVQUN6QixZQUFZO0FBQUEsUUFDaEI7QUFBQSxNQUNKO0FBQUE7QUFBQTtBQUFBLE1BR0EsVUFBVSxDQUFDLHlCQUF5QixVQUFVO0FBQUEsSUFDbEQ7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQTtBQUFBLElBRWIsUUFBUTtBQUFBO0FBQUEsSUFFUixTQUFTO0FBQUEsTUFDTCxNQUFNLENBQUM7QUFBQTtBQUFBLElBQ1g7QUFBQTtBQUFBLElBRUEsV0FBVztBQUFBO0FBQUEsSUFFWCxRQUFRO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsRUFDVjtBQUFBO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDSixTQUFTLEtBQUssVUFBVSxRQUFRLElBQUksYUFBYSxZQUFZO0FBQUEsRUFDakU7QUFBQTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUM3QixZQUFZLFFBQVEsa0NBQVcsU0FBUztBQUFBLElBQzVDO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
