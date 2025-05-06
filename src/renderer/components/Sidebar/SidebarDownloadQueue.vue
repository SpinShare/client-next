<template>
    <SidebarItemButton
        label="Downloads"
        icon="download"
        :expanded="expanded"
        :active="isActive"
        :badge="queueItemCount > 0 ? queueItemCount : false"
        @click="handleToggleQueue"
        v-interactable
    />
    <div
        :class="`downloads-queue ${expanded ? 'expanded' : ''}`"
        v-if="isActive"
    >
        <SectionHeader :title="`Download Queue (${queueItemCount})`">
            <button
                class="button ghost"
                @click="handleClearDone"
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
            label="No downloads queued."
            icon="music-2"
            v-else
        />
    </div>
    <div
        :class="`download-queue-backdrop  ${expanded ? 'expanded' : ''}`"
        @click="handleToggleQueue"
        v-if="isActive"
    ></div>
</template>

<script setup>
import SidebarItemButton from '@/components/Sidebar/SidebarItemButton.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import SectionHeader from '@/components/SectionHeader.vue';
import DownloadQueueItem from '@/components/DownloadQueueItem.vue';
import Remixicon from '@/components/Remixicon.vue';
import EmptyState from '@/components/EmptyState.vue';

const queue = inject('queue');
const mitt = inject('mitt');
const isActive = ref(false);
const queueItemsList = ref([]);
const queueItemCount = ref(0);

defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

onMounted(async () => {
    queueItemsList.value = await queue.getQueueItems();
    queueItemCount.value = await queue.getQueueCount();

    mitt.on('queue-open', () => {
        isActive.value = true;
    });

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
        }
    });
});
onUnmounted(() => {
    mitt.off('queue-change');
    mitt.off('queue-count-change');
    mitt.off('queue-done');
    mitt.off('item-change');
});

function handleToggleQueue() {
    isActive.value = !isActive.value;
}

async function handleClearDone() {
    await queue.clearQueueDone();
}

async function handleRestartFailed() {
    // TODO
}

async function handleRemoveItem(chartId) {
    await queue.removeQueueItem(chartId);
}
</script>

<style scoped>
.downloads-queue {
    @apply fixed top-[60px] bottom-0 overflow-hidden left-[70px] w-[450px] border-base-800 border-r bg-base-950 transition-all ease-snappy z-50 flex flex-col gap-2.5;

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
</style>
