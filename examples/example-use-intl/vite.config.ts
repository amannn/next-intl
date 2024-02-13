import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['use-intl']
  },
  build: {
    commonjsOptions: {
      include: [/use-intl/, /node_modules/]
    }
  }
});
