import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      protocol: 'ws',      // Đổi 'wss' thành 'ws'
      clientPort: 5173     // Đổi 443 thành đúng port dev (5173)
    }
  }
})