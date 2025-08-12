import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
    define: {
    global: 'window', // Polyfill. It tries to get global, but global doesnt exist in this version
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})