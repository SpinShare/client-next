<template>
    <section class="setup-general">
        <SectionHeader title="General settings" />

        <SettingsItem label="Theme">
            <select
                class="select"
                v-model="settings.theme"
                @change="handleSave"
                v-interactable
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
                v-interactable
            >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="nl">Dutch</option>
                <option value="speen">SPEEN</option>
            </select>
        </SettingsItem>
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
                v-model="settings.musicEnabled"
                @change="handleSave"
            />
        </SettingsItem>
    </section>
</template>

<script setup>
import SectionHeader from "@/components/SectionHeader.vue";
import Switch from "@/components/Switch.vue";
import SettingsItem from "@/components/Settings/SettingsItem.vue";
import { onMounted, inject, ref } from 'vue';

const settingsManager = inject('settingsManager');
const settings = ref({});
const mitt = inject('mitt');

onMounted(async () => {
    settings.value = await settingsManager.getAll();
});

async function handleSave() {
    mitt.emit('save-settings', settings.value);

    // Required to lose the reference to the vue reactive state for ipc
    const serializedSettings = JSON.parse(JSON.stringify(settings.value));
    await settingsManager.saveAll(serializedSettings);
}
</script>

<style scoped>
.setup-general {
    @apply flex flex-col gap-4;

    & p {
        @apply text-base-500 dark:text-base-300;
    }
}
</style>
