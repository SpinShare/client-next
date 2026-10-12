<template>
    <div class="room-track">
        <component
            :is="link ? RouterLink : 'div'"
            :to="link"
            :class="`room-track-item ${link ? '' : 'local-chart'}`"
            v-interactable="!!link"
        >
            <div
                class="cover"
                :style="cover ? `background-image: url('${cover}')` : ''"
            ></div>
            <div class="content">
                <h2>{{ title }}</h2>
                <div
                    class="info"
                    v-if="status"
                >
                    <div :class="`installation-status ${status}`">
                        {{ $t(STATUS_LABELS[status]) }}
                    </div>
                </div>
            </div>
        </component>

        <button
            class="button brand"
            @click="handleAddToQueue"
            v-interactable
            v-if="showManualDownload"
        >
            <template v-if="status === 'outOfDate'">
                <Remixicon icon="refresh" />
                <span>{{ $t('chart.update') }}</span>
            </template>
            <template v-else>
                <Remixicon icon="download" />
                <span>{{ $t('chart.addToQueue') }}</span>
            </template>
        </button>
    </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import Remixicon from '@/components/Remixicon.vue';
import { DownloadItem } from '../../../main/queue/downloadQueueItem';

const STATUS_LABELS = {
    installed: 'chart.status.installed',
    outOfDate: 'chart.status.outOfDate',
    missing: 'header.roomSync.track.missing',
    notCustom: 'header.roomSync.track.notCustom',
    notOnSpinShare: 'header.roomSync.track.notOnSpinShare',
};

const props = defineProps({
    track: {
        type: Object,
        required: true,
    },
    autoDownload: {
        type: Boolean,
        default: false,
    },
    autoUpdate: {
        type: Boolean,
        default: false,
    },
});

const api = inject('api');
const mitt = inject('mitt');
const queue = inject('queue');
const libraryManager = inject('libraryManager');
const title = ref(props.track.title);
const cover = ref(null);
const link = ref(null);
const status = ref(null);
const chart = ref(null);

const showManualDownload = computed(() => {
    if (!chart.value) return false;
    if (status.value === 'missing') return !props.autoDownload;
    if (status.value === 'outOfDate') return !props.autoUpdate;
    return false;
});
let resolveCount = 0;

onMounted(() => {
    mitt.on('cache-change', resolve);
});

onUnmounted(() => {
    mitt.off('cache-change', resolve);
});

watch(() => props.track, resolve, { immediate: true });

async function resolve() {
    const resolveId = ++resolveCount;
    const result = await resolveTrack(props.track);

    if (resolveId !== resolveCount) return;

    title.value = result.title;
    cover.value = result.cover;
    link.value = result.link;
    status.value = result.status;
    chart.value = result.chart ?? null;
}

async function handleAddToQueue() {
    const newDownloadItem = new DownloadItem(chart.value.id, chart.value.cover, chart.value.title, chart.value.artist, chart.value.charter, chart.value.fileReference, false);
    await queue.addQueueItem(newDownloadItem);
}

async function resolveTrack(track) {
    const fallback = { title: track.title, cover: null, link: null };

    if (!track.custom) {
        return { ...fallback, status: 'notCustom' };
    }
    const fileReference = track.fileReference;
    if (!fileReference?.startsWith('spinshare_')) {
        return { ...fallback, status: 'notOnSpinShare' };
    }

    const [cacheItem, chart] = await Promise.all([libraryManager.get(fileReference), api.getChartDetail(fileReference)]);

    if (cacheItem) {
        const thumbnail = await libraryManager.getThumbnail(fileReference);

        const isOutOfDate = chart?.updateHash && cacheItem.updateHash !== chart.updateHash;

        return {
            title: cacheItem.title,
            cover: thumbnail ? `data:image/png;base64,${thumbnail}` : null,
            link: `/chart/${chart?.id ?? fileReference}`,
            status: isOutOfDate ? 'outOfDate' : 'installed',
            chart,
        };
    }

    // Not installed and SpinShare is unreachable, nothing to link to
    if (!chart) {
        return { ...fallback, status: 'missing' };
    }

    return {
        title: chart.title,
        cover: chart.cover,
        link: `/chart/${chart.id}`,
        status: 'missing',
        chart,
    };
}
</script>

<style scoped>
.room-track {
    @apply flex flex-col gap-2;

    & .button {
        @apply w-full justify-center;
    }
}

.room-track-item {
    @apply bg-base-300 dark:bg-base-800 relative rounded-md overflow-hidden transition-all cursor-pointer text-left p-2 grid grid-cols-[auto_1fr] gap-3 items-center;

    & .cover {
        @apply aspect-square w-[48px] rounded bg-center bg-cover bg-base-300 dark:bg-base-800;
    }
    & .content {
        @apply flex flex-col gap-1.5 overflow-hidden;

        & h2 {
            @apply line-clamp-1;
        }
        & .info {
            @apply flex flex-wrap gap-2;

            & .installation-status {
                @apply text-xs py-0.5 px-1.5 rounded;

                &.installed {
                    @apply bg-green-800 text-green-50;
                }
                &.outOfDate {
                    @apply bg-purple-800 text-purple-50;
                }
                &.missing {
                    @apply bg-red-800 text-red-50;
                }
                &.notCustom,
                &.notOnSpinShare {
                    @apply bg-base-300 text-base-700 dark:bg-base-700 dark:text-base-200;
                }
            }
        }
    }

    &:hover {
        @apply bg-base-400 dark:bg-base-700;
    }

    &.local-chart {
        @apply bg-transparent border border-base-300 dark:border-base-800 cursor-default;
    }
}
</style>
