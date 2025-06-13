import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // Escucha en todas las interfaces de red (o usa '192.168.2.154')
    port: 5173,      // Puerto opcional (puedes cambiarlo si lo necesitas)
  },
});