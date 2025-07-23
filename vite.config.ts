import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: 'localhost', // Asegura que se enlace a localhost
    port: 5173, // Puedes especificar el puerto
    proxy: {
      '/api': {
        target: 'https://appwebpresidenciamontemo-506fa.web.app/',
        changeOrigin: true,
      },
    },
  },
});

