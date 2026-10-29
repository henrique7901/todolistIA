import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }, // porta liberada no CORS_ORIGIN padrão do backend
});
