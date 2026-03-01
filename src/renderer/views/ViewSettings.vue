<template>
    <LayoutBase>
        <section class="page-settings">
            <SettingsSection :label="$t('settings.general.header')">
                <SettingsItem
                    label="SpinShare Client Next"
                    :description="$t('settings.general.version', { version: appVersion })"
                >
                    <button
                        class="button"
                        @click="handleUpdate"
                        v-if="!updateAvailable"
                        v-interactable
                    >
                        <Remixicon icon="refresh" />
                        <span>{{ $t('settings.general.checkForUpdates') }}</span>
                    </button>
                    <button
                        class="button brand"
                        @click="handleGetUpdate"
                        v-if="updateAvailable"
                        v-interactable
                    >
                        <Remixicon icon="refresh" />
                        <span>{{ $t('settings.general.getUpdate') }}</span>
                    </button>
                </SettingsItem>
                <SettingsItem :label="$t('settings.general.theme.label')">
                    <select
                        class="select"
                        v-model="settings.theme"
                        @change="handleSave"
                        v-interactable
                    >
                        <option value="dark">{{ $t('settings.general.theme.dark') }}</option>
                        <option value="light">{{ $t('settings.general.theme.light') }}</option>
                    </select>
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.general.language.label')"
                    :description="$t('settings.general.language.description')"
                >
                    <select
                        class="select"
                        v-model="settings.language"
                        @change="handleSave"
                        v-interactable
                    >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="nl">Dutch</option>
                        <option value="speen">SPEEN</option>
                    </select>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection :label="$t('settings.interface.header')">
                <SettingsItem
                    :label="$t('settings.interface.showExplicit.label')"
                    :description="$t('settings.interface.showExplicit.description')"
                >
                    <Switch
                        v-model="settings.showExplicit"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.interface.downloadNotifications.label')"
                    :description="$t('settings.interface.downloadNotifications.description')"
                >
                    <Switch
                        v-model="settings.downloadNotifications"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.interface.openDownloadQueue.label')"
                    :description="$t('settings.interface.openDownloadQueue.description')"
                >
                    <Switch
                        v-model="settings.openDownloadsSidebar"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.interface.sfxEnabled.label')"
                    :description="$t('settings.interface.sfxEnabled.description')"
                >
                    <Switch
                        v-model="settings.sfxEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.interface.musicEnabled.label')"
                    :description="$t('settings.interface.musicEnabled.description') + ' (Music by MintoDog)'"
                >
                    <Switch
                        v-model="settings.musicEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.interface.musicVolume.label')"
                    :description="$t('settings.interface.musicVolume.description')"
                >
                    <input
                        v-interactable
                        class="input"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        v-model="settings.musicVolume"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.interface.sfxVolume.label')"
                    :description="$t('settings.interface.sfxVolume.description')"
                >
                    <input
                        v-interactable
                        class="input"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        v-model="settings.sfxVolume"
                        @change="handleSave"
                    />
                </SettingsItem>
            </SettingsSection>

            <SettingsSection
                :label="$t('settings.account.header')"
                v-if="isLoggedIn"
            >
                <SettingsItem
                    :label="$t('settings.account.logout.label')"
                    :description="$t('settings.account.logout.description')"
                >
                    <button
                        class="button"
                        @click="handleLogout"
                        v-interactable
                    >
                        <Remixicon icon="door-open" />
                        <span>{{ $t('settings.account.logout.logout') }}</span>
                    </button>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection :label="$t('settings.game.header')">
                <SettingsItem
                    :label="$t('settings.game.pathCustoms.label')"
                    :description="$t('settings.game.pathCustoms.description')"
                    :error="customsPathIsValid ? null : $t('settings.game.pathCustoms.notAFolder')"
                >
                    <input
                        v-interactable
                        class="input"
                        type="text"
                        :placeholder="$t('settings.game.pathCustoms.placeholder')"
                        v-model="settings.pathCustoms"
                        @change="handleSave"
                    />
                    <button
                        class="button"
                        @click="handleCustomsSelect"
                        v-interactable
                    >
                        <Remixicon icon="folder-open" />
                        <span>{{ $t('settings.game.pathCustoms.select') }}</span>
                    </button>
                    <button
                        class="button"
                        @click="handleCustomsDetect"
                        v-interactable
                    >
                        <Remixicon icon="brain" />
                        <span>{{ $t('settings.game.pathCustoms.detect') }}</span>
                    </button>
                </SettingsItem>
            </SettingsSection>
        </section>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import SettingsSection from '@/components/Settings/SettingsSection.vue';
import SettingsItem from '@/components/Settings/SettingsItem.vue';
import Remixicon from '@/components/Remixicon.vue';
import Switch from '@/components/Switch.vue';
import { onMounted, inject, ref, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n({ useScope: 'global' });
const externalApi = inject('externalApi');
const settingsManager = inject('settingsManager');
const updateManager = inject('updateManager');
const settings = ref({});
const mitt = inject('mitt');
const connect = inject('connect');
const isLoggedIn = ref(false);
const updateAvailable = ref(false);
const appVersion = ref('0.0.0');
const customsPathIsValid = ref(null);

onMounted(async () => {
    settings.value = await settingsManager.getAll();

    mitt.on('update-check-done', (hasNewRelease) => {
        updateAvailable.value = hasNewRelease;
    });
    appVersion.value = await updateManager.getAppVersion();
    updateAvailable.value = await updateManager.checkForUpdates();
    customsPathIsValid.value = await externalApi.folderExists(settings.value.pathCustoms);

    mitt.on('auth-updated', onAuthUpdated);
    await onAuthUpdated();
});

onUnmounted(() => {
    mitt.off('auth-updated');
    mitt.off('update-check-done');
});

async function onAuthUpdated() {
    isLoggedIn.value = await connect.isLoggedIn();
}

function handleGetUpdate() {
    externalApi.openUrl('https://github.com/SpinShare/client-next/releases/latest');
}
async function handleUpdate() {
    updateManager.checkForUpdates();
}

async function handleLogout() {
    await connect.logout();
    mitt.emit('auth-updated');
}

async function handleCustomsSelect() {
    const folderPath = await externalApi.selectFolder(settings.value.pathCustoms);
    if (folderPath) {
        settings.value.pathCustoms = folderPath;
        await handleSave();
    }
}

async function handleCustomsDetect() {
    settings.value.pathCustoms = await settingsManager.getDefaultCustomsPath();
    await handleSave();
}

async function handleSave() {
    mitt.emit('save-settings', settings.value);

    if (settings.value.language !== locale.value) {
        locale.value = settings.value.language;
    }

    customsPathIsValid.value = await externalApi.folderExists(settings.value.pathCustoms);

    // Required to lose the reference to the vue reactive state for ipc
    const serializedSettings = JSON.parse(JSON.stringify(settings.value));
    await settingsManager.saveAll(serializedSettings);
}
</script>

<style scoped>
.page-settings {
    @apply p-10 flex flex-col gap-10;

    & select {
        @apply grow;
    }
}
</style>
