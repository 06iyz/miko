import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // localtunnelの一時URLからスマホで開発画面を確認するための設定。本番Viteでは使用しない。
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
