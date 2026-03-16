import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import yaml from '@rollup/plugin-yaml';
import jsconfigPaths from 'vite-jsconfig-paths';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '#q-app/wrappers': fileURLToPath(new URL('./node_modules/@quasar/app-vite/exports/wrappers/wrappers.js', import.meta.url)),
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: 'test/vitest/setup-file.js',
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/vitest/__tests__'
      // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
      'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/css/quasar.variables.scss',
    }),
    yaml({ include: ['**/src/config/feature-flags.yml', '**/src/config/colors.yml'] }),
    jsconfigPaths(),
  ],
});
