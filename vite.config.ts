import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set base to root to ensure assets load correctly in local dev and production root
  base: '/',
  // Define process.env to prevent "process is not defined" error in browser
  define: {
    'process.env': {}
  }
})