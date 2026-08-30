import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

/* 모닝 브리핑 Apps Script 엔드포인트.
   개발 서버에서는 아래 프록시가, 배포에서는 api/briefing.js가 이 URL을 서버사이드로 대신 부른다
   (브라우저 직접 호출은 CORS로 막히므로). URL을 바꾸면 api/briefing.js도 함께 고칠 것. */
const BRIEFING_EXEC =
  'https://script.google.com/macros/s/AKfycbzYG7r1vMmMyLp0jquvndWvHhLx9lnf0ZWTSGUthJzNYhUNMF4tstYEiytT8DQbX6-dEQ/exec'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /* dev에서 /api/briefing 을 Apps Script 웹앱으로 프록시 (302 리다이렉트 추적) */
      '/api/briefing': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        rewrite: () => new URL(BRIEFING_EXEC).pathname,
      },
      /* dev 마켓 시세 — 불안정한 corsproxy.io 대신 Yahoo 차트 API를 직접 프록시.
         배포는 api/quote.js 서버리스가 담당(같은 경로 아님). */
      '/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        rewrite: (path) => path.replace(/^\/yahoo/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@hub': fileURLToPath(new URL('./src/hub', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@noran': fileURLToPath(new URL('./src/products/noran', import.meta.url)),
      '@isa': fileURLToPath(new URL('./src/products/isa', import.meta.url)),
      '@pension': fileURLToPath(new URL('./src/products/pension', import.meta.url)),
      '@card': fileURLToPath(new URL('./src/products/card', import.meta.url)),
      '@utility': fileURLToPath(new URL('./src/products/utility', import.meta.url)),
    },
  },
})
