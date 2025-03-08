import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [vue(), tailwindcss(), svgLoader()],
    resolve: {
        alias: [
            {
                find: '@',
                replacement: fileURLToPath(new URL('./src', import.meta.url)),
            },
            {
                find: '@views',
                replacement: fileURLToPath(
                    new URL('./src/renderer/views', import.meta.url),
                ),
            },
            {
                find: '@layouts',
                replacement: fileURLToPath(
                    new URL('./src/renderer/layouts', import.meta.url),
                ),
            },
            {
                find: '@components',
                replacement: fileURLToPath(
                    new URL('./src/renderer/components', import.meta.url),
                ),
            },
            {
                find: '@assets',
                replacement: fileURLToPath(
                    new URL('./src/renderer/assets', import.meta.url),
                ),
            },
            {
                find: '@css',
                replacement: fileURLToPath(
                    new URL('./src/renderer/assets/css', import.meta.url),
                ),
            },
            {
                find: '@images',
                replacement: fileURLToPath(
                    new URL('./src/renderer/assets/images', import.meta.url),
                ),
            },
        ],
    },
});
