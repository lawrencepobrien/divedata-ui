import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Dev proxy target: the nginx fronting the API/Keycloak stack. Override with the
// API_TARGET env var if your backend runs elsewhere. `secure: false` because the
// proxy serves a self-signed cert in dev.
const apiTarget = process.env.API_TARGET ?? 'https://divedata.duckdns.org'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // API
      '/api': { target: apiTarget, changeOrigin: true, secure: false },
      // Keycloak — login pages, protocol endpoints, static assets
      '/realms':    { target: apiTarget, changeOrigin: true, secure: false },
      '/resources': { target: apiTarget, changeOrigin: true, secure: false },
      '/js':        { target: apiTarget, changeOrigin: true, secure: false },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
