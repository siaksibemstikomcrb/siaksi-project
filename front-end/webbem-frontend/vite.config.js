import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',

    resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- SETTINGAN PRODUCTION (KEAMANAN) ---
  build: {
    // 1. Matikan Source Map 
    // Supaya orang lain tidak bisa melihat struktur folder & kodingan asli abang di menu "Inspect Element -> Sources"
    sourcemap: false, 
  },

  esbuild: {
    // 2. Bersihkan Log Otomatis
    // Saat 'npm run build', semua console.log dan debugger akan dihapus.
    // Jadi di laptop abang (dev) log-nya muncul, tapi di server (prod) bersih total.
    drop: ['console', 'debugger'], 
  }



})