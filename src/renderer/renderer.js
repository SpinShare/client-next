import { createApp } from 'vue';
import App from './App.vue';
import '@fontsource-variable/outfit';
import 'remixicon/fonts/remixicon.css';
import '@/assets/css/app.css';
import Router from './router';
import mitt from 'mitt';
import * as Sentry from '@sentry/electron';

Sentry.init({
    dsn: 'https://d1445074964dee4d6d1b2d9f1bae8a7b@o1420803.ingest.us.sentry.io/4509152324222976',
});

const app = createApp(App);

app.provide('externalApi', window.externalApi);
app.provide('api', window.api);
app.provide('mitt', mitt());

app.use(Router);
app.mount('#app');
