import { fileURLToPath, URL } from "node:url";
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    svgLoader(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '@views', replacement: fileURLToPath(new URL('./src/views', import.meta.url)) },
      { find: '@layouts', replacement: fileURLToPath(new URL('./src/layouts', import.meta.url)) },
      { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
      { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
      { find: '@css', replacement: fileURLToPath(new URL('./src/assets/css', import.meta.url)) },
      { find: '@images', replacement: fileURLToPath(new URL('./src/assets/images', import.meta.url)) },
    ],
  }
});