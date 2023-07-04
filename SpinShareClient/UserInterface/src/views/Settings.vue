<template>
    <AppLayout>
        <section class="view-settings">
            <SpinHeader
                label="Settings"
            >
                <SpinButton
                    @click="openSettingsFolder"
                    icon="folder"
                    v-tooltip="'Open settings folder'"
                />
                <SpinButton
                    icon="content-save"
                    label="Save"
                    :color="settingsDirty ? 'bright' : 'default'"
                    @click="handleSave"
                />
            </SpinHeader>
            <SpinInput
                label="Game path"
                type="path"
                hint="This is where your game installation is located"
            >
                <input
                    type="text"
                    disabled
                    v-model="settingGamePath"
                />
                <SpinButton
                    icon="folder-outline"
                    :disabled="savingSettings"
                    @click="selectGamePathManually"
                    v-tooltip="'Browse manually'"
                />
                <SpinButton
                    icon="brain"
                    :disabled="savingSettings"
                    @click="getGamePathAutomatically"
                    v-tooltip="'Detect automatically'"
                />
            </SpinInput>
            <SpinInput
                label="Customs folder path"
                type="path"
                hint="This is where your custom charts are located. Don't forget to setup the 'custom_path [FULLPATH]' launch option if you want your library to be somewhere else."
            >
                <input
                    type="text"
                    disabled
                    v-model="settingLibraryPath"
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
            <SpinInput
                label="Language"
                hint="Translation by SpinShare"
                type="horizontal"
            >
                <div class="select">
                    <select
                        v-model="settingLanguage"
                        @change="settingsDirty = true"
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
                hint="Save to apply your theme"
                type="horizontal"
            >
                <div class="select">
                    <select
                        v-model="settingTheme"
                        @change="settingsDirty = true"
                        :disabled="savingSettings"
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                    <span class="mdi mdi-chevron-down"></span>
                </div>
            </SpinInput>
            <SpinInput
                label="Detect DLCs"
                hint="By analyzing your game installation, we can confirm which DLCs you have bought. This will enable access to DLC charts."
                type="horizontal"
            >
                <SpinButton
                    label="Detect"
                    :disabled="isDetectingDlcs"
                    :loading="isDetectingDlcs"
                    @click="detectDLCs"
                />
            </SpinInput>
            <SpinInput
                label="Detected DLCs"
                type="horizontal"
                :hint="detectedDlcs.join(', ')"
                v-if="detectedDlcs.length > 0 && !isDetectingDlcs"
            >
            </SpinInput>
            <!--
            <SpinInput
                label="Silent Queue"
                hint="Disables the automatic reveal of the download sidebar when adding new charts to the queue"
                type="horizontal"
            >
                <SpinSwitch
                    v-model="settingSilentQueue"
                    @change="settingsDirty = true"
                    :disabled="savingSettings"
                />
            </SpinInput> -->
            <!--
            <SpinInput
                label="Software Updates"
                hint="Version 3.0.0"
                type="horizontal"
            >
                <SpinButton
                    icon="update"
                    label="Check for updates"
                    :loading="checkingForUpdates"
                    :disabled="savingSettings || checkingForUpdates"
                    @click="checkForUpdates"
                />
            </SpinInput> -->
            <SpinInput
                label="Third Party licenses"
                hint="This project was created with third party libraries."
                type="horizontal"
            >
                <SpinButton
                    label="See licenses"
                    @click="openLicenses"
                />
            </SpinInput>
        </section>
    </AppLayout>
</template>

<script setup>
import AppLayout from "@/layouts/AppLayout.vue";
import SpinInput from "@/components/Common/SpinInput.vue";
import { ref, inject, onMounted } from 'vue';
import router from "@/router";
const emitter = inject('emitter');

const settingLibraryPath = ref('');
const settingGamePath = ref('');
const settingLanguage = ref('en-US');
const settingTheme = ref('dark');
const savingSettings = ref(false);
const settingsDirty = ref(false);
const isDetectingDlcs = ref(false);
const detectedDlcs = ref([]);
//const checkingForUpdates = ref(false);

onMounted(() => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-get-full",
        data: "",
    }));
});

emitter.on('library-get-path-response', (path) => {
    settingsDirty.value = true;
    
    if(path !== '') {
        settingLibraryPath.value = path;
    }
});

emitter.on('game-get-path-response', (path) => {
    settingsDirty.value = true;

    if(path !== '') {
        settingGamePath.value = path;
    }
});

emitter.on('settings-set-response', (settings) => {
    savingSettings.value = false;
    settingsDirty.value = false;
    setSettings(settings);
});

emitter.on('settings-get-full-response', (settings) => {
    setSettings(settings);
});

emitter.on('game-detect-dlcs-response', (dlcs) => {
    if(dlcs) detectedDlcs.value = Object.keys(dlcs) ?? [];
    isDetectingDlcs.value = false;
});

const openSettingsFolder = () => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-open-in-explorer",
        data: "",
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

const detectDLCs = () => {
    isDetectingDlcs.value = true;
    
    window.external.sendMessage(JSON.stringify({
        command: "game-detect-dlcs",
        data: [],
    }));
};

/* const checkForUpdates = () => {
    checkingForUpdates.value = true;
}; */

const openLicenses = () => {
    router.push({
        path: '/licenses',
    });
};

const handleSave = () => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-set",
        data: [{
            key: 'game.path',
            value: settingGamePath.value,
        },{
            key: 'library.path',
            value: settingLibraryPath.value,
        },{
            key: 'app.language',
            value: settingLanguage.value,
        },{
            key: 'app.theme',
            value: settingTheme.value,
        },],
    }));

    savingSettings.value = true;
};

const setSettings = (settings) => {
    settingLanguage.value = settings['app.language'];
    settingTheme.value = settings['app.theme'];
    settingLibraryPath.value = settings['library.path'];
    settingGamePath.value = settings['game.path'];

    emitter.emit('update-theme', settings['app.theme']);
    
    if(settings['dlcs']) detectedDlcs.value = Object.keys(settings['dlcs']) ?? [];
    isDetectingDlcs.value = false;
};
</script>

<style lang="scss" scoped>
.view-settings {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    & > section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
}
</style>
