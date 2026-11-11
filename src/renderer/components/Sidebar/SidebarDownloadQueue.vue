<template>
    <SidebarItemButton
        :label="$t('sidebar.downloadQueue.downloads')"
        icon="download"
        :expanded="expanded"
        :active="isActive"
        :badge="pendingItems > 0 ? pendingItems : false"
        :badge-icon="allItemsDone && !hideQueueDoneCheckmark ? 'check' : false"
        @click="handleToggleQueue"
        v-interactable
    />
    <Teleport
        to="#app"
        :disabled="!isBigPicture"
    >
        <div
            :class="`downloads-queue ${expanded ? 'expanded' : ''}`"
            v-if="isActive"
            data-nav-scope
            @nav-back.prevent="isActive = false"
        >
            <SectionHeader :title="$t('sidebar.downloadQueue.header', { count: pendingItems })">
                <button
                    class="button ghost"
                    @click="handleClearDone"
                    data-nav-autofocus
                    v-interactable
                >
                    <Remixicon icon="delete-bin" />
                </button>
                <button
                    class="button ghost"
                    @click="handleRestartFailed"
                    v-interactable
                >
                    <Remixicon icon="refresh" />
                </button>
            </SectionHeader>

            <div
                class="list"
                v-if="queueItemsList.length > 0"
            >
                <DownloadQueueItem
                    v-for="item in queueItemsList"
                    :key="item.id"
                    v-bind="item"
                    @remove="handleRemoveItem"
                />
            </div>
            <EmptyState
                class="m-5 mt-0"
                :label="$t('sidebar.downloadQueue.noDownloads')"
                icon="music-2"
                v-else
            />
        </div>
        <div
            :class="`download-queue-backdrop  ${expanded ? 'expanded' : ''}`"
            @click="handleToggleQueue"
            v-if="isActive"
        ></div>
    </Teleport>
</template>

<script setup>
import SidebarItemButton from '@/components/Sidebar/SidebarItemButton.vue';
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import SectionHeader from '@/components/SectionHeader.vue';
import DownloadQueueItem from '@/components/DownloadQueueItem.vue';
import Remixicon from '@/components/Remixicon.vue';
import EmptyState from '@/components/EmptyState.vue';
import { gamepadState, isBigPicture } from '@/modules/gamepad/state';

const queue = inject('queue');
const mitt = inject('mitt');
const settingsManager = inject('settingsManager');
const isActive = ref(false);
const queueItemsList = ref([]);
const queueItemCount = ref(0);
const hideQueueDoneCheckmark = ref(false);

function onSettingsSaved(newSettings) {
    hideQueueDoneCheckmark.value = newSettings.hideQueueDoneCheckmark;
}

defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

onMounted(async () => {
    queueItemsList.value = await queue.getQueueItems();
    queueItemCount.value = await queue.getQueueCount();
    hideQueueDoneCheckmark.value = await settingsManager.get('hideQueueDoneCheckmark');
    mitt.on('save-settings', onSettingsSaved);

    mitt.on('queue-open', onQueueOpen);
    mitt.on('queue-toggle', handleToggleQueue);
    mitt.on('queue-close', onQueueClose);

    mitt.on('queue-change', (queueItems) => {
        queueItemsList.value = queueItems;
    });
    mitt.on('queue-count-change', (queueCount) => {
        queueItemCount.value = queueCount;
    });
    mitt.on('queue-done', () => {
        mitt.emit('sfx-queue-done');
    });
    mitt.on('item-change', (queueItem) => {
        const index = queueItemsList.value.findIndex((item) => item.id === queueItem.id);

        if (index !== -1) {
            const updatedItems = [...queueItemsList.value];
            updatedItems[index] = queueItem;
            queueItemsList.value = updatedItems;

            if (updatedItems[index].state === 4) {
                mitt.emit('sfx-error');
            }
        }
    });
});
onUnmounted(() => {
    mitt.off('queue-change');
    mitt.off('queue-count-change');
    mitt.off('queue-done');
    mitt.off('item-change');
    mitt.off('save-settings', onSettingsSaved);
    mitt.off('queue-open', onQueueOpen);
    mitt.off('queue-toggle', handleToggleQueue);
    mitt.off('queue-close', onQueueClose);
});

watch(isActive, (active) => {
    gamepadState.downloadsOpen = active;
});

function onQueueOpen() {
    isActive.value = true;
}

function onQueueClose() {
    isActive.value = false;
}

const pendingItems = computed(() => {
    return queueItemsList.value.filter((item) => item?.state === 0).length || 0;
});

const allItemsDone = computed(() => {
    return queueItemsList.value.length > 0 && queueItemsList.value.every((item) => item?.state === 3);
});

function handleToggleQueue() {
    isActive.value = !isActive.value;
}

async function handleClearDone() {
    await queue.clearQueueDone();
}

async function handleRestartFailed() {
    await queue.restartFailed();
}

async function handleRemoveItem(chartId) {
    await queue.removeQueueItem(chartId);
}
</script>

<style scoped>
.downloads-queue {
    @apply fixed top-[60px] bottom-0 overflow-hidden left-[70px] w-[450px] border-base-300 dark:border-base-800 border-r bg-base-50 dark:bg-base-950 transition-all ease-snappy z-50 flex flex-col gap-2.5;

    &.expanded {
        @apply left-[275px];
    }

    & header {
        @apply p-5 pb-0;
    }
    & .list {
        @apply flex flex-col overflow-hidden overflow-y-auto px-5 pb-5;
    }
}
.download-queue-backdrop {
    @apply fixed inset-0 bg-base-950 opacity-50 cursor-pointer left-[70px] top-[60px] z-10;

    &.expanded {
        @apply left-[275px];
    }
}
:root.big-picture .downloads-queue {
    @apply left-[328px] top-4 bottom-[68px] w-[460px] z-80 rounded-2xl border border-base-200 dark:border-base-800 shadow-2xl;
    @apply bg-base-50/95 dark:bg-base-950/95 backdrop-blur-xl;
    animation: bp-queue-in 200ms var(--ease-snappy, ease-out);

    & header {
        @apply p-6 pb-0;
    }
    & .list {
        @apply px-6 pb-6;
    }
}
:root.big-picture .download-queue-backdrop {
    @apply hidden;
}
@keyframes bp-queue-in {
    from {
        opacity: 0;
        transform: translateX(-16px);
    }
}
</style>
