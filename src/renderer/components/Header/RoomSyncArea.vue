<template>
    <div
        class="room-sync-area"
        v-if="roomSyncEnabled"
    >
        <button
            class="button"
            v-interactable
            @click="roomSyncPopupOpen = !roomSyncPopupOpen"
        >
            <Remixicon icon="global" />
        </button>
        <transition name="popup">
            <div
                v-if="roomSyncPopupOpen"
                class="room-sync-popup"
            >
                <header>
                    <h1>{{ $t('header.roomSync.header') }}</h1>

                    <button
                        class="button ghost"
                        v-interactable
                        @click="handleOpenSettings"
                    >
                        <Remixicon icon="settings-2" />
                    </button>
                </header>

                <div class="content">
                    <EmptyState
                        label="todo"
                        icon="global"
                        class="m-4"
                    />
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import EmptyState from '@/components/EmptyState.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import router from '@/router';

const mitt = inject('mitt');
const settingsManager = inject('settingsManager');
const roomSyncEnabled = ref(false);
const roomSyncPopupOpen = ref(false);

onMounted(async () => {
    mitt.on('save-settings', onSettingsSaved);
    roomSyncEnabled.value = await settingsManager.get('roomSyncEnabled');
});

onUnmounted(() => {
    mitt.off('save-settings', onSettingsSaved);
});

function onSettingsSaved(newSettings) {
    roomSyncEnabled.value = newSettings.roomSyncEnabled;
    if (!roomSyncEnabled.value) {
        roomSyncPopupOpen.value = false;
    }
}

function handleOpenSettings() {
    roomSyncPopupOpen.value = false;
    router.push('/settings');
}
</script>

<style scoped>
.room-sync-area {
    @apply relative flex items-center;

    & .room-sync-popup {
        @apply absolute top-10 right-0 z-20 w-[400px] bg-base-200 dark:bg-base-900 rounded-md shadow-2xl block overflow-hidden;

        & header {
            @apply flex items-center px-4 py-2;

            & h1 {
                @apply font-bold grow;
            }
        }

        & .content {
            @apply flex flex-col max-h-[500px] overflow-hidden overflow-y-auto;
        }
    }
}
</style>
