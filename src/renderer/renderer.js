import { createApp } from 'vue';
import App from './App.vue';
import '@fontsource-variable/outfit';
import 'remixicon/fonts/remixicon.css';
import '@/assets/css/app.css';
import Router from './router';
import mitt from 'mitt';
import * as Sentry from '@sentry/electron/renderer';
import {createHoverDirective} from "@/modules/hoverDirective";
import {createI18n} from "vue-i18n";
import enMessages from "@/locales/en.json";
import deMessages from "@/locales/de.json";

Sentry.init({
    dsn: 'https://d1445074964dee4d6d1b2d9f1bae8a7b@o1420803.ingest.us.sentry.io/4509152324222976',
});

const app = createApp(App);
const mittInstance = mitt();

const i18n = createI18n({
    locale: await window.spshSettings.get('language') || 'en',
    fallbackLocale: 'en',
    messages: {
        en: enMessages,
        de: deMessages,
    }
});
app.use(i18n);

window.spshQueue.onQueueChange((queueItems) => {
    mittInstance.emit('queue-change', queueItems);
});
window.spshQueue.onQueueCountChange((queueCount) => {
    mittInstance.emit('queue-count-change', queueCount);
});
window.spshQueue.onItemChange((queueItem) => {
    mittInstance.emit('item-change', queueItem);
});
window.spshQueue.onItemAdd((queueItem) => {
    mittInstance.emit('item-add', queueItem);
});
window.spshQueue.onQueueDone(() => {
    mittInstance.emit('queue-done');
});
window.spshLibrary.onCacheChange((cacheItems) => {
    mittInstance.emit('cache-change', cacheItems);
});
window.spshLibrary.onCacheRebuildStart(() => {
    mittInstance.emit('cache-rebuild-start');
});
window.spshLibrary.onCacheRebuildProgress((status) => {
    mittInstance.emit('cache-rebuild-progress', status);
});
window.spshLibrary.onCacheRebuildDone(() => {
    mittInstance.emit('cache-rebuild-done');
});
window.spshUpdates.onUpdateCheckDone((hasNewRelease) => {
    mittInstance.emit('update-check-done', hasNewRelease);
});

// Handle deep link navigation
window.spshDeepLink.onNavigateTo((route) => {
    console.log(`Deep link navigation to: ${route}`);
    Router.push(route);
});

app.provide('externalApi', window.spshExternalApi);
app.provide('api', window.spshApi);
app.provide('settingsManager', window.spshSettings);
app.provide('updateManager', window.spshUpdates);
app.provide('libraryManager', window.spshLibrary);
app.provide('queue', window.spshQueue);
app.provide('connect', window.spshConnect);
app.provide('mitt', mittInstance);

/* SOUND EFFECTS */
app.directive('interactable', createHoverDirective());

app.use(Router);
app.mount('#app');
