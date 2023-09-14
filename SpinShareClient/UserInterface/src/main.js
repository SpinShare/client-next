import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import Router from "@/router";

import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';

import './assets/reset.scss';
import './assets/app.scss';
import '@mdi/font/scss/materialdesignicons.scss';

import mitt from 'mitt';

const app = createApp(App);

app.config.globalProperties.window = window;
app.provide('emitter', new mitt());
app.use(FloatingVue);
app.use(Router);

// i18n
import en from './i18n/en.json';
import de from './i18n/de.json';

const i18n = createI18n({
    locale: 'de',
    fallbackLocale: 'en',
    allowComposition: true,
    messages: {
        en: en,
        de: de,
    }
});
app.use(i18n);

// Components
import SpinButton from "@/components/Common/SpinButton.vue";
import SpinLoader from "@/components/Common/SpinLoader.vue";
import SpinSwitch from "@/components/Common/SpinSwitch.vue";
import SpinHeader from "@/components/Common/SpinHeader.vue";
import SpinTabBar from "@/components/Common/SpinTabBar.vue";
import SpinTabItem from "@/components/Common/SpinTabItem.vue";
import SpinInput from "@/components/Common/SpinInput.vue";
import SpinSelect from "@/components/Common/SpinSelect.vue";

app.component('SpinButton', SpinButton);
app.component('SpinLoader', SpinLoader);
app.component('SpinSwitch', SpinSwitch);
app.component('SpinHeader', SpinHeader);
app.component('SpinTabBar', SpinTabBar);
app.component('SpinTabItem', SpinTabItem);
app.component('SpinInput', SpinInput);
app.component('SpinSelect', SpinSelect);

app.mount('#app');