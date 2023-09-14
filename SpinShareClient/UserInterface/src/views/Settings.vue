<template>
    <AppLayout>
        <section class="view-settings">
            <SpinHeader
                :label="t('settings.title')"
            >
                <SpinButton
                    @click="openSettingsFolder"
                    icon="folder"
                    v-tooltip="t('settings.openSettings')"
                />
                <SpinButton
                    icon="content-save"
                    :label="t('general.save')"
                    :color="settingsDirty ? 'bright' : 'default'"
                    @click="handleSave"
                />
            </SpinHeader>
            <SpinInput
                :label="t('settings.gamePath.label')"
                type="path"
                :hint="t('settings.gamePath.hint')"
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
                    v-model="settingLibraryPath"
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
            <SpinInput
                :label="t('settings.language.label')"
                :hint="t('settings.language.credits')"
                type="horizontal"
            >
                <div class="select">
                    <select
                        v-model="settingLanguage"
                        @change="settingsDirty = true"
                        :disabled="savingSettings"
                    >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="speen">Speen</option>
                    </select>
                    <span class="mdi mdi-chevron-down"></span>
                </div>
            </SpinInput>
            <SpinInput
                :label="t('settings.theme.label')"
                :hint="t('settings.theme.hint')"
                type="horizontal"
            >
                <div class="select">
                    <select
                        v-model="settingTheme"
                        @change="settingsDirty = true"
                        :disabled="savingSettings"
                    >
                        <option value="dark">{{ t('settings.theme.dark') }}</option>
                        <option value="light">{{ t('settings.theme.light') }}</option>
                    </select>
                    <span class="mdi mdi-chevron-down"></span>
                </div>
            </SpinInput>
            <SpinInput
                :label="t('settings.detectDLCs.label')"
                :hint="t('settings.detectDLCs.hint')"
                type="horizontal"
            >
                <SpinButton
                    :label="t('settings.detectDLCs.detect')"
                    :disabled="isDetectingDlcs"
                    :loading="isDetectingDlcs"
                    @click="detectDLCs"
                />
            </SpinInput>
            <SpinInput
                :label="t('settings.detectDLCs.detectedDLCs')"
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
            <SpinInput
                :label="t('settings.updates.label')"
                :hint="currentVersion"
                type="horizontal"
            >
                <SpinButton
                    icon="update"
                    :label="t('settings.updates.check')"
                    :loading="checkingForUpdates"
                    :disabled="savingSettings || checkingForUpdates"
                    @click="checkForUpdates"
                />
            </SpinInput>
            <SpinInput
                :label="t('settings.thirdPartyLicenses.label')"
                :hint="t('settings.thirdPartyLicenses.hint')"
                type="horizontal"
            >
                <SpinButton
                    :label="t('settings.thirdPartyLicenses.seeLicenses')"
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

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const settingLibraryPath = ref('');
const settingGamePath = ref('');
const settingLanguage = ref('en');
const settingTheme = ref('dark');
const savingSettings = ref(false);
const settingsDirty = ref(false);
const isDetectingDlcs = ref(false);
const detectedDlcs = ref([]);
const currentVersion = ref("0.0.0");
const checkingForUpdates = ref(false);

onMounted(() => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-get-full",
        data: "",
    }));

    window.external.sendMessage(JSON.stringify({
        command: "update-get-version",
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

emitter.on('update-get-version-response', (version) => {
    currentVersion.value = version;
});

emitter.on('update-get-latest-response', (version) => {
    checkingForUpdates.value = false;
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

const checkForUpdates = () => {
    checkingForUpdates.value = true;
    
    window.external.sendMessage(JSON.stringify({
        command: "update-get-latest",
        data: "",
    }));
};

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
    
    window.external.sendMessage(JSON.stringify({
        command: "settings-get",
        data: "app.language",
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
