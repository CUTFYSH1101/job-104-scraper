import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
  },
  base: './',
  test: {
    environment: 'jsdom',
    include: 'tests/**/*.{test,spec}.{js,ts}',
  },
  server: {
    proxy: {
      '/api':{
        target: 'http://127.0.0.1:5000/',
        changeOrigin: true,
        // 前端呼叫 /api 時實際上在呼叫 http://127.0.0.1:5000/
        // 前端呼叫 /api/scrape 時實際上在呼叫 http://127.0.0.1:5000/scrape
        // http://127.0.0.1:5000/<path>
        // rewrite 會把 path 開頭的 /api 移除
        rewrite: path => path.replace(/^\/api/, ''),
      }
    }
  },
})
