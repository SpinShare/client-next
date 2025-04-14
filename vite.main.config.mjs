import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    sourcemap: true
  },

  plugins: [sentryVitePlugin({
    org: "spinshare",
    project: "client-next"
  })]
});