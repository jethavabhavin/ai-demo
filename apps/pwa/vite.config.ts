import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   server: {
      proxy: {
         '/api': 'http://localhost:3001',
      },
      allowedHosts: ['racism-parted-custard.ngrok-free.dev'],
   },
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
   },
})
