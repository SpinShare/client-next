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
                        :label="$t('header.roomSync.notInRoom')"
                        icon="global"
                        class="m-4"
                        v-if="!roomSyncRoom"
                    />
                    <div
                        class="room"
                        v-else
                    >
                        <h1>{{ roomSyncRoom.name }}</h1>
                        <p>
                            {{ $t('header.roomSync.players', { count: roomSyncRoom.players.length, max: roomSyncRoom.maxPlayers }) }}
                            &nbsp;&middot;&nbsp;
                            <span :class="roomSyncRoom.allowCustoms ? '' : 'no-customs'">{{ roomSyncRoom.allowCustoms ? $t('header.roomSync.customsAllowed') : $t('header.roomSync.customsNotAllowed') }}</span>
                        </p>
                        <RoomTrackItem
                            v-if="roomSyncTrack"
                            :track="roomSyncTrack"
                            :auto-download="roomSyncAutoDownload"
                            :auto-update="roomSyncAutoUpdate"
                            class="mt-3"
                        />
                    </div>
                </div>

                <div
                    v-if="!roomSyncAutoDownload || !roomSyncAutoUpdate"
                    class="settings"
                >
                    {{ $t('header.roomSync.settingsHint') }}
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import EmptyState from '@/components/EmptyState.vue';
import RoomTrackItem from '@/components/Charts/RoomTrackItem.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import router from '@/router';

const mitt = inject('mitt');
const settingsManager = inject('settingsManager');
const roomSync = inject('roomSync');
const roomSyncEnabled = ref(false);
const roomSyncHost = ref('');
const roomSyncAutoDownload = ref(false);
const roomSyncAutoUpdate = ref(false);
const roomSyncStatus = ref({ connected: false, outdated: false });
const roomSyncRoom = ref(null);
const roomSyncTrack = ref(null);
const roomSyncPopupOpen = ref(false);

onMounted(async () => {
    mitt.on('save-settings', onSettingsSaved);
    mitt.on('room-sync-status-change', onStatusChange);
    mitt.on('room-sync-room-change', onRoomChange);
    mitt.on('room-sync-track-change', onTrackChange);
    roomSyncEnabled.value = await settingsManager.get('roomSyncEnabled');
    roomSyncHost.value = await settingsManager.get('roomSyncHost');
    roomSyncAutoDownload.value = await settingsManager.get('roomSyncAutoDownload');
    roomSyncAutoUpdate.value = await settingsManager.get('roomSyncAutoUpdate');
    roomSyncStatus.value = await roomSync.getStatus();
    roomSyncRoom.value = await roomSync.getRoom();
    roomSyncTrack.value = await roomSync.getTrack();
});

onUnmounted(() => {
    mitt.off('save-settings', onSettingsSaved);
    mitt.off('room-sync-status-change', onStatusChange);
    mitt.off('room-sync-room-change', onRoomChange);
    mitt.off('room-sync-track-change', onTrackChange);
});

function onStatusChange(status) {
    roomSyncStatus.value = status;
}

function onRoomChange(room) {
    roomSyncRoom.value = room;
}

function onTrackChange(track) {
    roomSyncTrack.value = track;
}

function onSettingsSaved(newSettings) {
    roomSyncEnabled.value = newSettings.roomSyncEnabled;
    roomSyncHost.value = newSettings.roomSyncHost;
    roomSyncAutoDownload.value = newSettings.roomSyncAutoDownload;
    roomSyncAutoUpdate.value = newSettings.roomSyncAutoUpdate;
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
        & .no-customs {
            @apply text-red-400;
        }

        & .content {
            @apply flex flex-col max-h-[500px] overflow-hidden overflow-y-auto;

            & .room {
                @apply flex flex-col px-4 py-4 border-t border-base-300 dark:border-base-800;

                & p {
                    @apply text-base-500 dark:text-base-300;
                }
            }
        }

        & .settings {
            @apply px-4 py-3 border-t border-base-300 dark:border-base-800 text-base-600 dark:text-base-400;
        }
    }
}
</style>
