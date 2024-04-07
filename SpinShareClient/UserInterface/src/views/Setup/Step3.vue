<template>
    <SetupLayout
        :step="3"
        :title="t('setup.step3.title')"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="!savingSettings"
        :can-back="!savingSettings"
    >
        <SpinInput :label="t('settings.language.label')">
            <div class="select">
                <select
                    v-model="settingLanguage"
                    :disabled="savingSettings"
                >
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="speen">Speen</option>
                </select>
                <span class="mdi mdi-chevron-down"></span>
            </div>
        </SpinInput>
        <SpinInput :label="t('settings.theme.label')">
            <div class="select">
                <select
                    v-model="settingTheme"
                    :disabled="savingSettings"
                    @change="changeTheme"
                >
                    <option value="dark">{{ t('settings.theme.dark') }}</option>
                    <option value="light">
                        {{ t('settings.theme.light') }}
                    </option>
                </select>
                <span class="mdi mdi-chevron-down"></span>
            </div>
        </SpinInput>
        <!--
        <SpinInput
            label="Silent Queue"
            hint="Disables the automatic reveal of the download sidebar when adding new charts to the queue"
            type="horizontal"
        >
            <SpinSwitch
                v-model="settingSilentQueue"
                :disabled="savingSettings"
            />
        </SpinInput> -->
    </SetupLayout>
</template>

<script setup>
import { ref, inject } from 'vue';
import router from '@/router';
import SetupLayout from '@/layouts/SetupLayout.vue';
import SpinInput from '@/components/Common/SpinInput.vue';
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const settingLanguage = ref(window.navigator.language?.substring(0, 2) ?? 'en');
const settingTheme = ref(
    window.matchMedia('(prefers-color-scheme: dark').matches ? 'dark' : 'light',
);
const savingSettings = ref(false);

emitter.on('settings-set-response', () => {
    savingSettings.value = false;
    router.push({ path: '/setup/step-4' });
});

const handleBack = () => {
    router.push({ path: '/setup/step-2' });
};
const handleContinue = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'settings-set',
            data: [
                {
                    key: 'app.language',
                    value: settingLanguage.value,
                },
                {
                    key: 'app.theme',
                    value: settingTheme.value,
                },
            ],
        }),
    );

    savingSettings.value = true;
};

const changeTheme = () => {
    emitter.emit('update-theme', settingTheme.value);
};
</script>

<style lang="scss">
.ui-console .select {
    width: 600px;
}
</style>
