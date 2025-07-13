<template>
    <section class="setup-general">
        <SectionHeader title="General settings" />

        <SettingsItem
            label="Customs path"
            description="Path to your custom charts folder"
            :two-line="true"
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

        <p class="tip">Tip: To store your custom charts in a different folder or on a different drive, you can add <code>custom_path "C:\YOUR_PATH"</code> to your steam launch options.</p>
    </section>
</template>

<script setup>
import SectionHeader from "@/components/SectionHeader.vue";
import SettingsItem from "@/components/Settings/SettingsItem.vue";
import { onMounted, inject, ref } from 'vue';
import Remixicon from "@/components/Remixicon.vue";

const settingsManager = inject('settingsManager');
const externalApi = inject('externalApi');
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

async function handleCustomsSelect() {
    const folderPath = await externalApi.selectFolder(settings.value.pathCustoms);
    if(folderPath) {
        settings.value.pathCustoms = folderPath;
        await handleSave();
    }
}

async function handleCustomsDetect() {
    settings.value.pathCustoms = await settingsManager.getDefaultCustomsPath();
    await handleSave();
}
</script>

<style scoped>
.setup-general {
    @apply flex flex-col gap-4;

    & p {
        @apply text-base-500 dark:text-base-300;

        &.tip {
            @apply text-brand-700 dark:text-brand-300;
        }
    }

    & code {
        @apply text-xs font-bold p-1 py-0.5 bg-brand-800 text-brand-100 rounded inline-block;
        transform: translateY(-2px);
    }
}
</style>
