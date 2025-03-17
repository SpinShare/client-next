import { createApp } from 'vue';
import App from './App.vue';
import '@fontsource-variable/outfit';
import 'remixicon/fonts/remixicon.css';
import '@/assets/css/app.css';
import Router from './router';
import mitt from 'mitt';

const app = createApp(App);

app.provide('api', window.api);
app.provide('mitt', mitt());

app.use(Router);
app.mount('#app');
