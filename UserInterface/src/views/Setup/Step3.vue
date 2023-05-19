<template>
    <SetupLayout
        :step="3"
        title="Client Settings"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="!savingSettings"
        :can-back="!savingSettings"
    >
        <SetupInput
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
        </SetupInput>
        <SetupInput
            label="Silent Queue"
            hint="Disables the automatic reveal of the download sidebar when adding new charts to the queue"
            type="switch"
        >
            <SpinSwitch
                v-model="settingSilentQueue"
                :disabled="savingSettings"
            />
        </SetupInput>
    </SetupLayout>
</template>

<script setup>
import { ref, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
import SetupInput from "@/components/Common/SetupInput.vue";
const emitter = inject('emitter');

const settingLanguage = ref('en-US');
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
            key: 'app.silentQueue',
            value: settingSilentQueue.value,
        }],
    }));

    savingSettings.value = true;
};
</script>