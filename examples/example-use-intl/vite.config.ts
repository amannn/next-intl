import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // TODO: Remove after use-intl has full ESM support
  // https://vitejs.dev/guide/dep-pre-bundling#monorepos-and-linked-dependencies
  optimizeDeps: {include: ['use-intl']},
  build: {commonjsOptions: {include: [/use-intl/, /node_modules/]}}
});
