import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hub': fileURLToPath(new URL('./src/hub', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@noran': fileURLToPath(new URL('./src/products/noran', import.meta.url)),
      '@isa': fileURLToPath(new URL('./src/products/isa', import.meta.url)),
      '@pension': fileURLToPath(new URL('./src/products/pension', import.meta.url)),
      '@utility': fileURLToPath(new URL('./src/products/utility', import.meta.url)),
    },
  },
})
