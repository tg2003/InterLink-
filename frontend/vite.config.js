import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      // Proxy /uploads so uploaded files are served from the Express backend
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
