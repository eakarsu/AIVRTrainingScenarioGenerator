import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    ...(process.env.VITE_API_PROXY_TARGET ? { proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET,
        changeOrigin: true,
      },
    } } : {}),
  },
})
