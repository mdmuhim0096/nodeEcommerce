import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Target } from 'lucide-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:7000"
      }
    }
  }
})
