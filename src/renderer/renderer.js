import { createApp } from 'vue';
import App from './App.vue';
import '@fontsource-variable/outfit';
import 'remixicon/fonts/remixicon.css';
import '@/renderer/assets/css/app.css';
import Router from './router';

const app = createApp(App);

app.use(Router);
app.mount('#app');
