import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (empty prefix = don't filter to VITE_ only) so API_TARGET
  // and other non-browser vars are available here in the config.
  const env = loadEnv(mode, process.cwd(), '')

  // Where the Vite dev proxy should forward /api and Keycloak requests.
  // Set API_TARGET in .env.development.local to point at your local backend.
  const apiTarget = env.API_TARGET ?? 'https://divedata.duckdns.org'

  // When pointing directly at the Go backend (localhost), strip the /api prefix
  // that nginx normally handles in production. Without this, Go sees /api/divers/...
  // but its routes only match /divers/...
  const isDirectBackend = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(apiTarget)

  return {
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ...(isDirectBackend && { rewrite: (path) => path.replace(/^\/api/, '') }),
        },
        '/realms':    { target: apiTarget, changeOrigin: true, secure: false },
        '/resources': { target: apiTarget, changeOrigin: true, secure: false },
        '/js':        { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
  }
})
