<template>
    <SetupLayout
        :step="0"
        :title="t('setup.step0.title')"
        @continue="handleContinue"
    >
        <img src="@/assets/setup_start.svg" />
        <p>{{ t('setup.step0.text') }}</p>
    </SetupLayout>
</template>

<script setup>
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const handleContinue = () => {
    router.push({ path: '/setup/step-1' });
};
</script>