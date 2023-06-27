<template>
    <SetupLayout
        :step="3"
        title="Client Settings"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="!savingSettings"
        :can-back="!savingSettings"
    >
        <SpinInput
                label="Language"
        >
            <div class="select">
                <select
                    v-model="settingLanguage"
                    :disabled="savingSettings"
                >
                    <option value="en-US">English</option>
                    <option value="de-DE">German</option>
                    <option value="nl-NL">Dutch</option>
                    <option value="spn-SPN">Speen</option>
                </select>
                <span class="mdi mdi-chevron-down"></span>
            </div>
        </SpinInput>
        <SpinInput
            label="Theme"
        >
            <div class="select">
                <select
                    v-model="settingTheme"
                    :disabled="savingSettings"
                    @change="changeTheme"
                >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                </select>
                <span class="mdi mdi-chevron-down"></span>
            </div>
        </SpinInput>
        <SpinInput
            label="Silent Queue"
            hint="Disables the automatic reveal of the download sidebar when adding new charts to the queue"
            type="horizontal"
        >
            <SpinSwitch
                v-model="settingSilentQueue"
                :disabled="savingSettings"
            />
        </SpinInput>
    </SetupLayout>
</template>

<script setup>
import { ref, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
import SpinInput from "@/components/Common/SpinInput.vue";
const emitter = inject('emitter');

const settingLanguage = ref('en-US');
const settingTheme = ref('dark');
const settingSilentQueue = ref(false);
const savingSettings = ref(false);

emitter.on('settings-set-response', (settings) => {
    savingSettings.value = false;
    router.push({ path: '/setup/step-4' });
});

const handleBack = () => {
    router.push({ path: '/setup/step-2' });
};
const handleContinue = () => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-set",
        data: [{
            key: 'app.language',
            value: settingLanguage.value,
        },{
            key: 'app.theme',
            value: settingTheme.value,
        },{
            key: 'app.silentQueue',
            value: settingSilentQueue.value,
        }],
    }));

    savingSettings.value = true;
};

const changeTheme = () => {
    emitter.emit('update-theme', settingTheme.value);
};
</script>