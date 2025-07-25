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
        "/api/pokemon": {
          target: "https://api.pokemontcg.io/v2",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/pokemon/, ""),
          agent: new https.Agent({ rejectUnauthorized: false }),
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.error("Proxy error:", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              if (mode === 'development') {
                console.log(
                  `Proxying request to: ${req.method} ${proxyReq.path}`
                );
              }

              if (
                !proxyReq.getHeader("X-Api-Key") &&
                env.VITE_POKEMON_TCG_API_KEY
              ) {
                proxyReq.setHeader("X-Api-Key", env.VITE_POKEMON_TCG_API_KEY);
              }
            });
            proxy.on("proxyRes", (_proxyRes, req, _res) => {
              if (mode === 'development') {
                console.log(`Received response for: ${req.method} ${req.url}`);
              }
            });
          },
        },
      },
    },
  };
});
