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
              console.log(
                `Proxying request to: ${req.method} ${proxyReq.path}`
              );

              if (
                !proxyReq.getHeader("X-Api-Key") &&
                env.VITE_POKEMON_TCG_API_KEY
              ) {
                proxyReq.setHeader("X-Api-Key", env.VITE_POKEMON_TCG_API_KEY);
              }
            });
            proxy.on("proxyRes", (_proxyRes, req, _res) => {
              console.log(`Received response for: ${req.method} ${req.url}`);
            });
          },
        },
      },
    },
  };
});
