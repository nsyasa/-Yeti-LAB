// vite.config.mjs
import { defineConfig } from "file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import tailwindcss from "file:///C:/Users/Enes/Documents/-Yeti-LAB/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Enes\\Documents\\-Yeti-LAB";
var vite_config_default = defineConfig({
  base: process.env.NODE_ENV === "production" ? "/-Yeti-LAB/" : "/",
  // GitHub Pages base path for prod, root for dev
  plugins: [tailwindcss()],
  // Multi-page app configuration
  build: {
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        auth: resolve(__vite_injected_original_dirname, "auth.html")
      },
      output: {
        // Asset naming with hash for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        // Define global variables for external dependencies
        globals: {
          "chart.js": "Chart"
        }
      },
      // External dependencies (loaded from CDN)
      // Prevent bundling if accidentally imported
      external: ["chart.js"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRW5lc1xcXFxEb2N1bWVudHNcXFxcLVlldGktTEFCXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFbmVzXFxcXERvY3VtZW50c1xcXFwtWWV0aS1MQUJcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9FbmVzL0RvY3VtZW50cy8tWWV0aS1MQUIvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBiYXNlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gJy8tWWV0aS1MQUIvJyA6ICcvJywgLy8gR2l0SHViIFBhZ2VzIGJhc2UgcGF0aCBmb3IgcHJvZCwgcm9vdCBmb3IgZGV2XHJcbiAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV0sXHJcbiAgICAvLyBNdWx0aS1wYWdlIGFwcCBjb25maWd1cmF0aW9uXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxyXG4gICAgICAgICAgICAgICAgYXV0aDogcmVzb2x2ZShfX2Rpcm5hbWUsICdhdXRoLmh0bWwnKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3NldCBuYW1pbmcgd2l0aCBoYXNoIGZvciBjYWNoZSBidXN0aW5nXHJcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXHJcbiAgICAgICAgICAgICAgICAvLyBEZWZpbmUgZ2xvYmFsIHZhcmlhYmxlcyBmb3IgZXh0ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ2NoYXJ0LmpzJzogJ0NoYXJ0JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIEV4dGVybmFsIGRlcGVuZGVuY2llcyAobG9hZGVkIGZyb20gQ0ROKVxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGJ1bmRsaW5nIGlmIGFjY2lkZW50YWxseSBpbXBvcnRlZFxyXG4gICAgICAgICAgICBleHRlcm5hbDogWydjaGFydC5qcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICAgICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICAgICAgLy8gTWluaWZpY2F0aW9uIHNldHRpbmdzIChlc2J1aWxkIGlzIGZhc3RlcilcclxuICAgICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcclxuICAgICAgICAvLyBDb25maWd1cmUgZXNidWlsZCBzcGVjaWZpY3NcclxuICAgICAgICBlc2J1aWxkOiB7XHJcbiAgICAgICAgICAgIGRyb3A6IFtdLCAvLyBEb24ndCBkcm9wIGNvbnNvbGUubG9nIChrZWVwIGZvciBkZWJ1Z2dpbmcpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBTb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nIChkaXNhYmxlIGluIHByb2R1Y3Rpb24gaWYgbmVlZGVkKVxyXG4gICAgICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2Vyc1xyXG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgICBvcGVuOiB0cnVlLCAvLyBBdXRvLW9wZW4gYnJvd3NlclxyXG4gICAgfSxcclxuICAgIC8vIERlZmluZSBnbG9iYWwgY29uc3RhbnRzXHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgICBfX0RFVl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSxcclxuICAgIH0sXHJcbiAgICAvLyBSZXNvbHZlIGFsaWFzZXMgKG9wdGlvbmFsLCBmb3IgY2xlYW5lciBpbXBvcnRzKVxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgICAgICAgJ0Btb2R1bGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdtb2R1bGVzJyksXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLFNBQVMsb0JBQW9CO0FBQzlULFNBQVMsZUFBZTtBQUN4QixPQUFPLGlCQUFpQjtBQUZ4QixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixNQUFNLFFBQVEsSUFBSSxhQUFhLGVBQWUsZ0JBQWdCO0FBQUE7QUFBQSxFQUM5RCxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQUE7QUFBQSxFQUV2QixPQUFPO0FBQUEsSUFDSCxlQUFlO0FBQUEsTUFDWCxPQUFPO0FBQUEsUUFDSCxNQUFNLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3JDLE1BQU0sUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDeEM7QUFBQSxNQUNBLFFBQVE7QUFBQTtBQUFBLFFBRUosZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUE7QUFBQSxRQUVoQixTQUFTO0FBQUEsVUFDTCxZQUFZO0FBQUEsUUFDaEI7QUFBQSxNQUNKO0FBQUE7QUFBQTtBQUFBLE1BR0EsVUFBVSxDQUFDLFVBQVU7QUFBQSxJQUN6QjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBO0FBQUEsSUFFYixRQUFRO0FBQUE7QUFBQSxJQUVSLFNBQVM7QUFBQSxNQUNMLE1BQU0sQ0FBQztBQUFBO0FBQUEsSUFDWDtBQUFBO0FBQUEsSUFFQSxXQUFXO0FBQUE7QUFBQSxJQUVYLFFBQVE7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxFQUNWO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNKLFNBQVMsS0FBSyxVQUFVLFFBQVEsSUFBSSxhQUFhLFlBQVk7QUFBQSxFQUNqRTtBQUFBO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQzdCLFlBQVksUUFBUSxrQ0FBVyxTQUFTO0FBQUEsSUFDNUM7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
