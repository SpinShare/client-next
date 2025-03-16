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
                replacement: fileURLToPath(
                    new URL('./src/renderer', import.meta.url),
                ),
            },
        ],
    },
});
