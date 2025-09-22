import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import https from "https";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Build optimizations
    build: {
      // Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunk for React and core libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            
            // UI components chunk for Radix UI
            if (id.includes('@radix-ui/')) {
              return 'ui';
            }
            
            // Router chunk
            if (id.includes('react-router-dom')) {
              return 'router';
            }
            
            // Supabase chunk
            if (id.includes('@supabase/')) {
              return 'supabase';
            }
            
            // Utilities chunk
            if (id.includes('axios') || id.includes('zod') || id.includes('date-fns') || 
                id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            
            // Internationalization chunk
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            // Forms chunk
            if (id.includes('react-hook-form') || id.includes('@hookform/')) {
              return 'forms';
            }
            
            // Animation chunk
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            
            // Large node_modules packages
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
      // Minification with terser
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      // Source maps for debugging
      sourcemap: mode === 'development',
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Inline assets smaller than 4kb
      assetsInlineLimit: 4096
    },
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'axios',
        'zod'
      ],
      exclude: ['@supabase/auth-helpers-react']
    },
    // Asset optimization
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
    server: {
      proxy: {
        "/api": {
          target: "https://pokecollect-backend.onrender.com",
          changeOrigin: true,
          secure: true,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log("Sending Request to the Target:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url
              );
            });
          },
        },
      },
    },
  }
});
