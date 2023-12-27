import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./layout_desktop/App.vue";
import Router from "@/router";

import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
import "@imengyu/vue3-context-menu/lib/vue3-context-menu.css";

import "./assets/reset.scss";
import "./layout_desktop/assets/app.scss";
import "@mdi/font/scss/materialdesignicons.scss";

import mitt from "mitt";

const app = createApp(App);

app.config.globalProperties.window = window;
app.provide("emitter", new mitt());
app.use(FloatingVue);
app.use(Router);

// i18n
import en from "./i18n/en.json";
import de from "./i18n/de.json";
import speen from "./i18n/speen.json";

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  allowComposition: true,
  messages: {
    en: en,
    de: de,
    speen: speen,
  },
});
app.use(i18n);

window.external.sendMessage(
  JSON.stringify({
    command: "settings-get",
    data: "app.language",
  })
);

window.external.receiveMessage((rawResponse) => {
  const response = JSON.parse(rawResponse);
  if (response.Command === "settings-get-response") {
    if (response.Data.key === "app.language") {
      let osLanguage = window.navigator.language?.substring(0, 2) ?? "en";
      i18n.global.locale = response.Data.data ?? osLanguage;
    }
  }
});

// Components
import SpinButton from "@/layout_desktop/components/Common/SpinButton.vue";
import SpinLoader from "@/layout_desktop/components/Common/SpinLoader.vue";
import SpinSwitch from "@/layout_desktop/components/Common/SpinSwitch.vue";
import SpinHeader from "@/layout_desktop/components/Common/SpinHeader.vue";
import SpinTabBar from "@/layout_desktop/components/Common/SpinTabBar.vue";
import SpinTabItem from "@/layout_desktop/components/Common/SpinTabItem.vue";
import SpinInput from "@/layout_desktop/components/Common/SpinInput.vue";
import SpinSelect from "@/layout_desktop/components/Common/SpinSelect.vue";

app.component("SpinButton", SpinButton);
app.component("SpinLoader", SpinLoader);
app.component("SpinSwitch", SpinSwitch);
app.component("SpinHeader", SpinHeader);
app.component("SpinTabBar", SpinTabBar);
app.component("SpinTabItem", SpinTabItem);
app.component("SpinInput", SpinInput);
app.component("SpinSelect", SpinSelect);

app.mount("#app");
