<template>
    <LayoutBase>
        <section class="page-settings">
            <SettingsSection label="General">
                <SettingsItem
                    label="SpinShare Client Next"
                    description="Version 3.20.0"
                >
                    <button
                        class="button"
                        @click="handleUpdate"
                        v-interactable
                    >
                        <Remixicon icon="refresh" />
                        <span>Check for updates</span>
                    </button>
                </SettingsItem>
                <SettingsItem label="Theme">
                    <select
                        class="select"
                        v-model="settings.theme"
                        @change="handleSave"
                    >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                    </select>
                </SettingsItem>
                <SettingsItem
                    label="Language"
                    description="Translated by SpinShare"
                >
                    <select
                        class="select"
                        v-model="settings.language"
                        @change="handleSave"
                    >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="nl">Dutch</option>
                        <option value="speen">SPEEN</option>
                    </select>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection label="Interface">
                <SettingsItem
                    label="Show explicit"
                    description="Automatically unblur explicit charts metadata"
                >
                    <Switch
                        v-model="settings.showExplicit"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    label="Download notifications"
                    description="Notify when a chart was downloaded or the queue finished"
                >
                    <Switch
                        v-model="settings.downloadNotifications"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    label="Open download queue"
                    description="Automatically open the download queue whenever a new chart has been added to the queue"
                >
                    <Switch
                        v-model="settings.openDownloadsSidebar"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    label="Sound effects enabled"
                    description="Plays UI sound effects"
                >
                    <Switch
                        v-model="settings.sfxEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
                <SettingsItem
                    label="Menu music enabled"
                    description="Plays menu music"
                >
                    <Switch
                        v-model="settings.sfxEnabled"
                        @change="handleSave"
                    />
                </SettingsItem>
            </SettingsSection>

            <SettingsSection
                label="Account"
                v-if="isLoggedIn"
            >
                <SettingsItem
                    label="Logout"
                    description="After logging out, you should also remove access to 'SpinShare Next' on spinsha.re"
                >
                    <button
                        class="button"
                        @click="handleLogout"
                        v-interactable
                    >
                        <Remixicon icon="door-open" />
                        <span>Logout</span>
                    </button>
                </SettingsItem>
            </SettingsSection>

            <SettingsSection label="Game">
                <SettingsItem
                    label="Customs path"
                    description="Path to your custom charts folder"
                >
                    <input
                        v-interactable
                        class="input"
                        type="text"
                        placeholder="Not set"
                        v-model="settings.pathCustoms"
                        @change="handleSave"
                    />
                    <button
                        class="button"
                        @click="handleCustomsSelect"
                        v-interactable
                    >
                        <Remixicon icon="folder-open" />
                        <span>Select</span>
                    </button>
                    <button
                        class="button"
                        @click="handleCustomsDetect"
                        v-interactable
                    >
                        <Remixicon icon="brain" />
                        <span>Detect</span>
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
import { onMounted, inject, ref, onUnmounted } from 'vue';

const settingsManager = inject('settingsManager');
const settings = ref({});
const mitt = inject('mitt');
const connect = inject('connect');
const isLoggedIn = ref(false);

onMounted(async () => {
    settings.value = await settingsManager.getAll();
    mitt.on('auth-updated', onAuthUpdated);
    await onAuthUpdated();
});

onUnmounted(() => {
    mitt.off('auth-updated');
});

async function onAuthUpdated() {
    isLoggedIn.value = await connect.isLoggedIn();
}

async function handleUpdate() {
    // TODO
}

async function handleLogout() {
    await connect.logout();
    mitt.emit('auth-updated');
}

async function handleCustomsSelect() {
    // TODO
}

async function handleCustomsDetect() {
    settings.value.pathCustoms = await settingsManager.getDefaultCustomsPath();
    await handleSave();
}

async function handleSave() {
    mitt.emit('save-settings', settings.value);

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
