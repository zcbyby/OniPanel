import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'web'),
  build: {
    outDir: path.resolve(__dirname, 'web/dist'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1567',
        changeOrigin: true,
      }
    }
  }
})
