import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Para rutas relativas
  server: {
    host: '192.168.1.20',
    port: 5173,
  },
});