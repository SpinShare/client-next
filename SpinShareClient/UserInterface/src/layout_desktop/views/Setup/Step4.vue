<template>
    <SetupLayout
        :step="4"
        :title="t('setup.step4.title')"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="!savingSettings"
    >
        <img src="../../../assets/setup_finish.svg" />
        <p>{{ t('setup.step4.text') }}</p>
    </SetupLayout>
</template>

<script setup>
import { ref, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layout_desktop/layouts/SetupLayout.vue";
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const savingSettings = ref(false);

const handleBack = () => {
    router.push({ path: '/setup/step-3' });
};

emitter.on('settings-set-response', (settings) => {
    savingSettings.value = false;
    router.push({ path: '/' });
});

const handleContinue = () => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-set",
        data: [{
            key: 'app.setup.done',
            value: true,
        }],
    }));

    savingSettings.value = true;
};
</script>