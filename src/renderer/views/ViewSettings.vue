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
                        <option value="ru">Russian</option>
                        <option value="zh">Chinese</option>
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
                    :description="`${$t('settings.interface.musicEnabled.description')} (${$t('settings.interface.musicEnabled.credit', { artist: 'MintoDog' })})`"
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
                <SettingsItem
                    :label="$t('settings.interface.previewVolume.label')"
                    :description="$t('settings.interface.previewVolume.description')"
                >
                    <input
                        v-interactable
                        class="input"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        v-model="settings.previewVolume"
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
                <SettingsItem
                    :label="$t('settings.game.libraryHashCache.label')"
                    :description="$t('settings.game.libraryHashCache.description')"
                >
                    <select
                        class="select"
                        v-model.number="settings.libraryHashCacheHours"
                        @change="handleSave"
                        v-interactable
                    >
                        <option :value="4">{{ $t('settings.game.libraryHashCache.hours4') }}</option>
                        <option :value="12">{{ $t('settings.game.libraryHashCache.hours12') }}</option>
                        <option :value="24">{{ $t('settings.game.libraryHashCache.day1') }}</option>
                        <option :value="72">{{ $t('settings.game.libraryHashCache.days3') }}</option>
                        <option :value="168">{{ $t('settings.game.libraryHashCache.days7') }}</option>
                    </select>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection
                :label="$t('settings.experimental.header')"
                v-if="settings.showExperimentalSettings"
            >
                <SettingsItem
                    :label="$t('settings.experimental.roomSyncEnabled.label')"
                    :description="$t('settings.experimental.roomSyncEnabled.description')"
                >
                    <Switch
                        v-model="settings.roomSyncEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.experimental.roomSyncHost.label')"
                    :description="$t('settings.experimental.roomSyncHost.description')"
                    :error="roomSyncHostIsValid ? null : $t('settings.experimental.roomSyncHost.invalid')"
                >
                    <input
                        v-interactable
                        class="input"
                        type="text"
                        :placeholder="$t('settings.experimental.roomSyncHost.placeholder')"
                        :disabled="!settings.roomSyncEnabled"
                        v-model.trim="settings.roomSyncHost"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.experimental.roomSyncAutoDownload.label')"
                    :description="$t('settings.experimental.roomSyncAutoDownload.description')"
                >
                    <Switch
                        v-model="settings.roomSyncAutoDownload"
                        :disabled="!settings.roomSyncEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.experimental.roomSyncAutoUpdate.label')"
                    :description="$t('settings.experimental.roomSyncAutoUpdate.description')"
                >
                    <Switch
                        v-model="settings.roomSyncAutoUpdate"
                        :disabled="!settings.roomSyncEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    :label="$t('settings.experimental.openDebugger.label')"
                    :description="$t('settings.experimental.openDebugger.description')"
                >
                    <button
                        class="button"
                        @click="handleOpenDebugger"
                        v-interactable
                    >
                        <Remixicon icon="bug" />
                        <span>{{ $t('settings.experimental.openDebugger.open') }}</span>
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
const roomSyncHostIsValid = computed(() => /^[^\s:]+:\d{1,5}$/.test(settings.value.roomSyncHost ?? ''));

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
let konamiProgress = 0;

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

    window.addEventListener('keydown', handleKonamiKey);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKonamiKey);
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

async function handleKonamiKey(event) {
    // Arrow keys inside form fields change their values, don't count those
    if (event.target.closest('input, select, textarea')) return;

    if (event.key === KONAMI_CODE[konamiProgress]) {
        konamiProgress++;
    } else {
        konamiProgress = event.key === KONAMI_CODE[0] ? 1 : 0;
    }
    if (konamiProgress < KONAMI_CODE.length) return;

    konamiProgress = 0;
    mitt.emit('sfx-experimental-unlocked');
    settings.value.showExperimentalSettings = true;
    await handleSave();
}

function handleOpenDebugger() {
    externalApi.openDevTools();
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
