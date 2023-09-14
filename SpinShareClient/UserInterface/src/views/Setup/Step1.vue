<template>
    <SetupLayout
        :step="1"
        :title="t('setup.step1.title')"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="libraryPath !== '' && !savingSettings"
        :can-back="!savingSettings"
    >
        <SpinInput
            :label="t('settings.gamePath.label')"
            type="path"
            :hint="t('settings.gamePath.hint')"
        >
            <input
                type="text"
                disabled
                v-model="gamePath"
            />
            <SpinButton
                icon="folder-outline"
                :disabled="savingSettings"
                @click="selectGamePathManually"
                v-tooltip="t('settings.gamePath.browseManually')"
            />
            <SpinButton
                icon="brain"
                :disabled="savingSettings"
                @click="getGamePathAutomatically"
                v-tooltip="t('settings.gamePath.detectAutomatically')"
            />
        </SpinInput>
        <SpinInput
            :label="t('settings.customsPath.label')"
            type="path"
            :hint="t('settings.customsPath.hint')"
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
                v-tooltip="t('settings.gamePath.browseManually')"
            />
            <SpinButton
                icon="brain"
                :disabled="savingSettings"
                @click="getLibraryPathAutomatically"
                v-tooltip="t('settings.gamePath.detectAutomatically')"
            />
        </SpinInput>
    </SetupLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
import SpinInput from "@/components/Common/SpinInput.vue";
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const gamePath = ref("");
const libraryPath = ref("");
const savingSettings = ref(false);

const selectGamePathManually = () => {
    window.external.sendMessage(JSON.stringify({
        command: "game-select-path",
        data: [],
    }));
};
const getGamePathAutomatically = () => {
    window.external.sendMessage(JSON.stringify({
        command: "game-get-path",
        data: [],
    }));
};
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
    getGamePathAutomatically();
    getLibraryPathAutomatically();
});

emitter.on('game-get-path-response', (path) => {
    if(path !== '') {
        gamePath.value = path;
    }
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
            key: 'game.path',
            value: gamePath.value,
        },{
            key: 'library.path',
            value: libraryPath.value,
        }],
    }));
    
    savingSettings.value = true;
};
</script>