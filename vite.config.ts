import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: 'NEXT_PUBLIC_',
  server: {
    proxy: {
      '/api': {
        target: 'https://pfpbackend-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
