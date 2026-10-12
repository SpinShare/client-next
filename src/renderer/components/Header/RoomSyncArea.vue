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

                <div
                    class="status outdated"
                    v-if="roomSyncStatus.connected && roomSyncStatus.outdated"
                >
                    <span>{{ $t('header.roomSync.outdated') }}</span>
                </div>
                <div
                    class="status connected"
                    v-else-if="roomSyncStatus.connected"
                >
                    <span>{{ $t('header.roomSync.connected', { host: roomSyncHost }) }}</span>
                </div>
                <div
                    class="status disconnected"
                    v-else
                >
                    <span>{{ $t('header.roomSync.disconnected') }}</span>
                </div>

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
const roomSync = inject('roomSync');
const roomSyncEnabled = ref(false);
const roomSyncHost = ref('');
const roomSyncStatus = ref({ connected: false, outdated: false });
const roomSyncPopupOpen = ref(false);

onMounted(async () => {
    mitt.on('save-settings', onSettingsSaved);
    mitt.on('room-sync-status-change', onStatusChange);
    roomSyncEnabled.value = await settingsManager.get('roomSyncEnabled');
    roomSyncHost.value = await settingsManager.get('roomSyncHost');
    roomSyncStatus.value = await roomSync.getStatus();
});

onUnmounted(() => {
    mitt.off('save-settings', onSettingsSaved);
    mitt.off('room-sync-status-change', onStatusChange);
});

function onStatusChange(status) {
    roomSyncStatus.value = status;
}

function onSettingsSaved(newSettings) {
    roomSyncEnabled.value = newSettings.roomSyncEnabled;
    roomSyncHost.value = newSettings.roomSyncHost;
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

        & .status {
            @apply px-4 py-2 text-sm border-t border-base-300 dark:border-base-800;

            &.connected {
                @apply text-emerald-200 bg-emerald-900;
            }
            &.disconnected {
                @apply text-red-200 bg-red-900;
            }
            &.outdated {
                @apply text-base-200 bg-base-700;
            }
        }

        & .content {
            @apply flex flex-col max-h-[500px] overflow-hidden overflow-y-auto;
        }
    }
}
</style>
