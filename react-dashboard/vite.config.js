import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// VITE_BASE_URL defaults to '/' (Vercel). GitHub Actions sets it to '/ICC_T20_World_Cup_2024_Data_Analysis/'
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
})
