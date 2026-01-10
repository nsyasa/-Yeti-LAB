// vite.config.mjs
import { defineConfig } from "file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import tailwindcss from "file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Enes\\Documents\\-Yeti-LAB";
var vite_config_default = defineConfig({
  base: "/-Yeti-LAB/",
  // GitHub Pages base path
  plugins: [tailwindcss()],
  // Multi-page app configuration
  build: {
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        auth: resolve(__vite_injected_original_dirname, "auth.html"),
        teacher: resolve(__vite_injected_original_dirname, "teacher.html"),
        profile: resolve(__vite_injected_original_dirname, "profile.html"),
        admin: resolve(__vite_injected_original_dirname, "admin.html"),
        studentDashboard: resolve(__vite_injected_original_dirname, "student-dashboard.html")
      },
      output: {
        // Asset naming with hash for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        // Define global variables for external dependencies
        globals: {
          "@supabase/supabase-js": "supabase",
          // Global variable name from CDN
          "chart.js": "Chart"
        }
      },
      // External dependencies (loaded from CDN)
      // Prevent bundling if accidentally imported
      external: ["@supabase/supabase-js", "chart.js"]
    },
    outDir: "dist",
    emptyOutDir: true,
    // Minification settings (esbuild is faster)
    minify: "esbuild",
    // Configure esbuild specifics
    esbuild: {
      drop: []
      // Don't drop console.log (keep for debugging)
    },
    // Source maps for debugging (disable in production if needed)
    sourcemap: false,
    // Target modern browsers
    target: "es2020"
  },
  server: {
    port: 3e3,
    open: true
    // Auto-open browser
  },
  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production")
  },
  // Resolve aliases (optional, for cleaner imports)
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@modules": resolve(__vite_injected_original_dirname, "modules")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRW5lc1xcXFxEb2N1bWVudHNcXFxcLVlldGktTEFCXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFbmVzXFxcXERvY3VtZW50c1xcXFwtWWV0aS1MQUJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9FbmVzL0RvY3VtZW50cy8tWWV0aS1MQUIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBiYXNlOiAnLy1ZZXRpLUxBQi8nLCAvLyBHaXRIdWIgUGFnZXMgYmFzZSBwYXRoXHJcbiAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV0sXHJcbiAgICAvLyBNdWx0aS1wYWdlIGFwcCBjb25maWd1cmF0aW9uXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgYXV0aDogcmVzb2x2ZShfX2Rpcm5hbWUsICdhdXRoLmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIHRlYWNoZXI6IHJlc29sdmUoX19kaXJuYW1lLCAndGVhY2hlci5odG1sJyksXHJcbiAgICAgICAgICAgICAgICBwcm9maWxlOiByZXNvbHZlKF9fZGlybmFtZSwgJ3Byb2ZpbGUuaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgYWRtaW46IHJlc29sdmUoX19kaXJuYW1lLCAnYWRtaW4uaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgc3R1ZGVudERhc2hib2FyZDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzdHVkZW50LWRhc2hib2FyZC5odG1sJyksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgICAgICAgLy8gQXNzZXQgbmFtaW5nIHdpdGggaGFzaCBmb3IgY2FjaGUgYnVzdGluZ1xyXG4gICAgICAgICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxyXG4gICAgICAgICAgICAgICAgLy8gRGVmaW5lIGdsb2JhbCB2YXJpYWJsZXMgZm9yIGV4dGVybmFsIGRlcGVuZGVuY2llc1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnOiAnc3VwYWJhc2UnLCAvLyBHbG9iYWwgdmFyaWFibGUgbmFtZSBmcm9tIENETlxyXG4gICAgICAgICAgICAgICAgICAgICdjaGFydC5qcyc6ICdDaGFydCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gRXh0ZXJuYWwgZGVwZW5kZW5jaWVzIChsb2FkZWQgZnJvbSBDRE4pXHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgYnVuZGxpbmcgaWYgYWNjaWRlbnRhbGx5IGltcG9ydGVkXHJcbiAgICAgICAgICAgIGV4dGVybmFsOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcycsICdjaGFydC5qcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICAgICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICAgICAgLy8gTWluaWZpY2F0aW9uIHNldHRpbmdzIChlc2J1aWxkIGlzIGZhc3RlcilcclxuICAgICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcclxuICAgICAgICAvLyBDb25maWd1cmUgZXNidWlsZCBzcGVjaWZpY3NcclxuICAgICAgICBlc2J1aWxkOiB7XHJcbiAgICAgICAgICAgIGRyb3A6IFtdLCAvLyBEb24ndCBkcm9wIGNvbnNvbGUubG9nIChrZWVwIGZvciBkZWJ1Z2dpbmcpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBTb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nIChkaXNhYmxlIGluIHByb2R1Y3Rpb24gaWYgbmVlZGVkKVxyXG4gICAgICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2Vyc1xyXG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgICBvcGVuOiB0cnVlLCAvLyBBdXRvLW9wZW4gYnJvd3NlclxyXG4gICAgfSxcclxuICAgIC8vIERlZmluZSBnbG9iYWwgY29uc3RhbnRzXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgICBfX0RFVl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSxcclxuICAgIH0sXHJcbiAgICAvLyBSZXNvbHZlIGFsaWFzZXMgKG9wdGlvbmFsLCBmb3IgY2xlYW5lciBpbXBvcnRzKVxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgICAgICAgJ0Btb2R1bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdtb2R1bGVzJyksXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLFNBQVMsb0JBQW9CO0FBQzlULFNBQVMsZUFBZTtBQUN4QixPQUFPLGlCQUFpQjtBQUZ4QixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFBQTtBQUFBLEVBRXZCLE9BQU87QUFBQSxJQUNILGVBQWU7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNILE1BQU0sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDckMsTUFBTSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxRQUNwQyxTQUFTLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQzFDLFNBQVMsUUFBUSxrQ0FBVyxjQUFjO0FBQUEsUUFDMUMsT0FBTyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUN0QyxrQkFBa0IsUUFBUSxrQ0FBVyx3QkFBd0I7QUFBQSxNQUNqRTtBQUFBLE1BQ0EsUUFBUTtBQUFBO0FBQUEsUUFFSixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQTtBQUFBLFFBRWhCLFNBQVM7QUFBQSxVQUNMLHlCQUF5QjtBQUFBO0FBQUEsVUFDekIsWUFBWTtBQUFBLFFBQ2hCO0FBQUEsTUFDSjtBQUFBO0FBQUE7QUFBQSxNQUdBLFVBQVUsQ0FBQyx5QkFBeUIsVUFBVTtBQUFBLElBQ2xEO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUE7QUFBQSxJQUViLFFBQVE7QUFBQTtBQUFBLElBRVIsU0FBUztBQUFBLE1BQ0wsTUFBTSxDQUFDO0FBQUE7QUFBQSxJQUNYO0FBQUE7QUFBQSxJQUVBLFdBQVc7QUFBQTtBQUFBLElBRVgsUUFBUTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLEVBQ1Y7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ0osU0FBUyxLQUFLLFVBQVUsUUFBUSxJQUFJLGFBQWEsWUFBWTtBQUFBLEVBQ2pFO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDN0IsWUFBWSxRQUFRLGtDQUFXLFNBQVM7QUFBQSxJQUM1QztBQUFBLEVBQ0o7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
