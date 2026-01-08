// vite.config.mjs
import { defineConfig } from "file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import tailwindcss from "file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Enes\\Documents\\-Yeti-LAB";
var vite_config_default = defineConfig({
  base: "/-Yeti-LAB/",
  // GitHub Pages base path
  plugins: [
    tailwindcss()
  ],
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
        assetFileNames: "assets/[name]-[hash].[ext]"
      },
      // External dependencies (loaded from CDN)
      external: []
    },
    outDir: "dist",
    emptyOutDir: true,
    // Minification settings
    minify: "esbuild",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRW5lc1xcXFxEb2N1bWVudHNcXFxcLVlldGktTEFCXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFbmVzXFxcXERvY3VtZW50c1xcXFwtWWV0aS1MQUJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9FbmVzL0RvY3VtZW50cy8tWWV0aS1MQUIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgYmFzZTogJy8tWWV0aS1MQUIvJywgLy8gR2l0SHViIFBhZ2VzIGJhc2UgcGF0aFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICBdLFxyXG4gICAgLy8gTXVsdGktcGFnZSBhcHAgY29uZmlndXJhdGlvblxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgICAgICAgICBtYWluOiByZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIGF1dGg6IHJlc29sdmUoX19kaXJuYW1lLCAnYXV0aC5odG1sJyksXHJcbiAgICAgICAgICAgICAgICB0ZWFjaGVyOiByZXNvbHZlKF9fZGlybmFtZSwgJ3RlYWNoZXIuaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgcHJvZmlsZTogcmVzb2x2ZShfX2Rpcm5hbWUsICdwcm9maWxlLmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIGFkbWluOiByZXNvbHZlKF9fZGlybmFtZSwgJ2FkbWluLmh0bWwnKSxcclxuICAgICAgICAgICAgICAgIHN0dWRlbnREYXNoYm9hcmQ6IHJlc29sdmUoX19kaXJuYW1lLCAnc3R1ZGVudC1kYXNoYm9hcmQuaHRtbCcpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIC8vIEFzc2V0IG5hbWluZyB3aXRoIGhhc2ggZm9yIGNhY2hlIGJ1c3RpbmdcclxuICAgICAgICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gRXh0ZXJuYWwgZGVwZW5kZW5jaWVzIChsb2FkZWQgZnJvbSBDRE4pXHJcbiAgICAgICAgICAgIGV4dGVybmFsOiBbXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICAgIC8vIE1pbmlmaWNhdGlvbiBzZXR0aW5nc1xyXG4gICAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgICAgIC8vIFNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmcgKGRpc2FibGUgaW4gcHJvZHVjdGlvbiBpZiBuZWVkZWQpXHJcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzXHJcbiAgICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBwb3J0OiAzMDAwLFxyXG4gICAgICAgIG9wZW46IHRydWUsIC8vIEF1dG8tb3BlbiBicm93c2VyXHJcbiAgICB9LFxyXG4gICAgLy8gRGVmaW5lIGdsb2JhbCBjb25zdGFudHNcclxuICAgIGRlZmluZToge1xyXG4gICAgICAgIF9fREVWX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpLFxyXG4gICAgfSxcclxuICAgIC8vIFJlc29sdmUgYWxpYXNlcyAob3B0aW9uYWwsIGZvciBjbGVhbmVyIGltcG9ydHMpXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICAgICAgICAnQG1vZHVsZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ21vZHVsZXMnKSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVMsU0FBUyxvQkFBb0I7QUFDOVQsU0FBUyxlQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBRnhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLE1BQU07QUFBQTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ0wsWUFBWTtBQUFBLEVBQ2hCO0FBQUE7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNILGVBQWU7QUFBQSxNQUNYLE9BQU87QUFBQSxRQUNILE1BQU0sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDckMsTUFBTSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxRQUNwQyxTQUFTLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQzFDLFNBQVMsUUFBUSxrQ0FBVyxjQUFjO0FBQUEsUUFDMUMsT0FBTyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUN0QyxrQkFBa0IsUUFBUSxrQ0FBVyx3QkFBd0I7QUFBQSxNQUNqRTtBQUFBLE1BQ0EsUUFBUTtBQUFBO0FBQUEsUUFFSixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNwQjtBQUFBO0FBQUEsTUFFQSxVQUFVLENBQUM7QUFBQSxJQUNmO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUE7QUFBQSxJQUViLFFBQVE7QUFBQTtBQUFBLElBRVIsV0FBVztBQUFBO0FBQUEsSUFFWCxRQUFRO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsRUFDVjtBQUFBO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDSixTQUFTLEtBQUssVUFBVSxRQUFRLElBQUksYUFBYSxZQUFZO0FBQUEsRUFDakU7QUFBQTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUM3QixZQUFZLFFBQVEsa0NBQVcsU0FBUztBQUFBLElBQzVDO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
