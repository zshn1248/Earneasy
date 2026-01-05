import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // enable network access and default to port 80 for the user's requested local run
    host: true,
    port: 80,
  },
})
