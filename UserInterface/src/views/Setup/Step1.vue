<template>
    <SetupLayout
        :step="1"
        title="Game Paths"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="libraryPath !== '' && !savingSettings"
        :can-back="!savingSettings"
    >
        <SpinInput
            label="Customs folder path"
            type="library-path"
        >
            <input
                    type="text"
                    disabled
                    v-model="libraryPath"
            />
            <SpinButton
                    icon="folder-outline"
                    :disabled="savingSettings"
                    @click="selectLibraryPathManually"
                    v-tooltip="'Browse manually'"
            />
            <SpinButton
                    icon="brain"
                    :disabled="savingSettings"
                    @click="getLibraryPathAutomatically"
                    v-tooltip="'Detect automatically'"
            />
        </SpinInput>
    </SetupLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
const emitter = inject('emitter');

const libraryPath = ref("");
const savingSettings = ref(false);

const selectLibraryPathManually = () => {
    window.external.sendMessage(JSON.stringify({
        command: "library-select-path",
        data: [],
    }));
};
const getLibraryPathAutomatically = () => {
    window.external.sendMessage(JSON.stringify({
        command: "library-get-path",
        data: [],
    }));
};

onMounted(() => {
    getLibraryPathAutomatically();
});

emitter.on('library-get-path-response', (path) => {
    if(path !== '') {
        libraryPath.value = path;
    }
});

emitter.on('settings-set-response', (settings) => {
    savingSettings.value = false;
    router.push({ path: '/setup/step-2' });
});

const handleBack = () => {
    router.push({ path: '/setup/step-0' });
};
const handleContinue = () => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-set",
        data: [{
            key: 'library.path',
            value: libraryPath.value,
        }],
    }));
    
    savingSettings.value = true;
};
</script>