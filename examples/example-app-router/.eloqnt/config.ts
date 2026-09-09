import {defineConfig} from '@eloqnt/cli';

export default defineConfig({
  srcPath: './src',
  messages: {
    path: './messages',
    locales: 'infer',
    sourceLocale: 'en',
    format: 'json'
  }
});
