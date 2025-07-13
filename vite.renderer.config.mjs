import { sentryVitePlugin } from '@sentry/vite-plugin';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';
import tailwindAutoReference from 'vite-plugin-vue-tailwind-auto-reference';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        vue(),
        tailwindAutoReference('./src/renderer/assets/css/app.css'),
        tailwindcss(),
        svgLoader(),
        sentryVitePlugin({
            org: 'spinshare',
            project: 'client-next',
        }),
    ],

    resolve: {
        alias: [
            {
                find: '@',
                replacement: fileURLToPath(new URL('./src/renderer', import.meta.url)),
            },
        ],
    },

    build: {
        sourcemap: true,
        target: 'esnext',
    },
});
