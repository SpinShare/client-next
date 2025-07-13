<template>
    <section class="setup-general">
        <SectionHeader :title="$t('setup.game.header')" />

        <SettingsItem
            :label="$t('settings.game.pathCustoms.label')"
            :description="$t('settings.game.pathCustoms.description')"
            :two-line="true"
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

        <p class="tip" v-html="$t('setup.game.tip', {code: '<code>custom_path &quot;C:\\YOUR_PATH\&quot;</code>'})" />
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

<style>
.setup-general {
    & code {
        @apply text-xs font-bold p-1 py-0.5 bg-brand-800 text-brand-100 rounded inline-block;
        transform: translateY(-2px);
    }
}
</style>

<style scoped>
.setup-general {
    @apply flex flex-col gap-4;

    & p {
        @apply text-base-500 dark:text-base-300;

        &.tip {
            @apply text-brand-700 dark:text-brand-300;
        }
    }
}
</style>
