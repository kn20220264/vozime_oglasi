import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Docker na Windowsu ne prosljeđuje file-watch događaje kroz bind mount,
    // pa Vite bez pollinga ne vidi izmjene fajlova (HMR mrtav)
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
