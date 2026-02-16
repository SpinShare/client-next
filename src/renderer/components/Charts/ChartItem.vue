<template>
    <component
        :is="isLocalChart ? 'div' : RouterLink"
        :to="`/chart/${id || fileReference}`"
        :class="`chart-item ${isExplicit && !settingShowExplicit ? 'explicit' : ''} ${mini ? 'mini' : ''} ${isLocalChart ? 'local-chart' : ''} ${isCurrentlyPlaying ? 'playing' : ''}`"
        @click.middle.prevent="handleAddToQueue"
        v-interactable="!isLocalChart"
    >
        <div class="cover-container">
            <div
                v-if="!isLocal"
                class="cover"
                :style="`background-image: url('${cover}')`"
            ></div>
            <div
                v-else
                class="cover"
                :style="`background-image: url('data:image/png;base64,${localCoverCache}')`"
            ></div>
            <button
                v-if="!isLocalChart && !mini"
                class="play-button"
                @click.prevent="handlePlayPreview"
                v-interactable
                :title="isCurrentlyPlaying && audioIsPlaying ? 'Pause' : 'Play preview'"
            >
                <Remixicon
                    v-if="isCurrentlyPlaying && audioIsPlaying"
                    icon="pause"
                    filled
                />
                <Remixicon
                    v-else
                    icon="play"
                    filled
                />
            </button>
        </div>
        <div class="content">
            <div class="meta">
                <h2>{{ title }}</h2>
                <p>{{ artist }} &bull; {{ charter }}</p>
            </div>
            <div
                class="info"
                v-if="!mini"
            >
                <div
                    class="installation-status local"
                    v-if="isLocalChart"
                >
                    {{ $t('chart.status.local') }}
                </div>
                <div
                    class="installation-status installed"
                    v-if="!isLocalChart && cacheUpdateHash === updateHash"
                >
                    {{ $t('chart.status.installed') }}
                </div>
                <div
                    class="installation-status update"
                    v-if="!isLocalChart && cacheUpdateHash && cacheUpdateHash !== updateHash"
                >
                    {{ $t('chart.status.outOfDate') }}
                </div>
                <div class="difficulties">
                    <div :class="`difficulty ${hasEasyDifficulty ? 'active' : ''}`">
                        <span>E</span>
                        <span v-if="hasEasyDifficulty">{{ easyDifficulty }}</span>
                    </div>
                    <div :class="`difficulty ${hasNormalDifficulty ? 'active' : ''}`">
                        <span>N</span>
                        <span v-if="hasNormalDifficulty">{{ normalDifficulty }}</span>
                    </div>
                    <div :class="`difficulty ${hasHardDifficulty ? 'active' : ''}`">
                        <span>H</span>
                        <span v-if="hasHardDifficulty">{{ hardDifficulty }}</span>
                    </div>
                    <div :class="`difficulty ${hasExtremeDifficulty ? 'active' : ''}`">
                        <span>EX</span>
                        <span v-if="hasExtremeDifficulty">{{ expertDifficulty }}</span>
                    </div>
                    <div :class="`difficulty ${hasXDDifficulty ? 'active' : ''}`">
                        <span>XD</span>
                        <span v-if="hasXDDifficulty">{{ XDDifficulty }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="explicit-label"
            v-if="isExplicit && !settingShowExplicit"
        >
            {{ $t('chart.explicitLabel') }}
        </div>
    </component>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { DownloadItem } from '../../../main/queue/downloadQueueItem';
import { RouterLink } from 'vue-router';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import Remixicon from '@/components/Remixicon.vue';

const props = defineProps({
    id: {
        type: [Number, Boolean],
        default: false,
    },
    isLocal: {
        type: Boolean,
        default: false,
    },
    mini: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: [String, Boolean],
        default: false,
    },
    artist: {
        type: String,
        required: true,
    },
    charter: {
        type: String,
        required: true,
    },
    isExplicit: {
        type: Boolean,
        default: false,
    },
    hasEasyDifficulty: {
        type: Boolean,
        default: false,
    },
    hasNormalDifficulty: {
        type: Boolean,
        default: false,
    },
    hasHardDifficulty: {
        type: Boolean,
        default: false,
    },
    hasExtremeDifficulty: {
        type: Boolean,
        default: false,
    },
    hasXDDifficulty: {
        type: Boolean,
        default: false,
    },
    easyDifficulty: {
        type: Number,
        default: 0,
    },
    normalDifficulty: {
        type: Number,
        default: 0,
    },
    hardDifficulty: {
        type: Number,
        default: 0,
    },
    expertDifficulty: {
        type: Number,
        default: 0,
    },
    XDDifficulty: {
        type: Number,
        default: 0,
    },
    updateHash: {
        type: String,
        default: '',
    },
    fileReference: {
        type: String,
        required: true,
    },
    cover: {
        type: [String, Boolean],
        default: false,
    },
    chartList: {
        type: Array,
        default: () => [],
    },
});

const mitt = inject('mitt');
const queue = inject('queue');
const api = inject('api');
const settingsManager = inject('settingsManager');
const libraryManager = inject('libraryManager');
const settingShowExplicit = ref(false);
const localCoverCache = ref(null);
const cacheUpdateHash = ref(null);

// Audio player
const {
    currentChart,
    isPlaying: audioIsPlaying,
    loadChart,
    play,
    pause,
    setVolume,
} = useAudioPlayer();

const isCurrentlyPlaying = computed(() => {
    return currentChart.value?.id === props.id || currentChart.value?.fileReference === props.fileReference;
});

onMounted(async () => {
    settingShowExplicit.value = await settingsManager.get('showExplicit');

    if (props.isLocal) {
        localCoverCache.value = await libraryManager.getThumbnail(props.fileReference);
    }

    cacheUpdateHash.value = await libraryManager.getUpdateHash(props.fileReference);
    mitt.on('item-change', async (queueItem) => {
        if (queueItem.id !== props.id) return;
        cacheUpdateHash.value = await libraryManager.getUpdateHash(queueItem.fileReference);
    });
});

onUnmounted(() => {
    mitt.off('item-change');
});

const isLocalChart = computed(() => {
    return !Number.isInteger(props.id) && !props.fileReference.startsWith('spinshare_');
});

async function handleAddToQueue() {
    if (isLocalChart.value) return;

    const newDownloadItem = new DownloadItem(props.id, props.cover, props.title, props.artist, props.charter, props.fileReference);
    await queue.addQueueItem(newDownloadItem);
}

async function handlePlayPreview(event) {
    // Prevent navigation when clicking play button
    event.stopPropagation();

    if (isCurrentlyPlaying.value && audioIsPlaying.value) {
        // If this chart is currently playing, pause it
        pause();
    } else {
        // Fetch the full chart details to get the correct audio path
        console.log('Fetching chart details for ID:', props.id);
        const fullChartData = await api.getChartDetail(props.id);

        if (!fullChartData) {
            console.error('Failed to fetch chart details');
            return;
        }

        console.log('Got chart data with audio path:', fullChartData.paths?.ogg);

        // Load the chart with the playlist if available
        // For the playlist, we need to fetch each chart's details as well
        // Only apply previewVolume for the first song; preserve user-adjusted volume after that
        const wasPlaying = audioIsPlaying.value;
        loadChart(fullChartData, props.chartList.length > 0 ? props.chartList : null);

        if (!wasPlaying) {
            const volume = await settingsManager.get('previewVolume');
            setVolume(volume);
        }

        // Play the audio
        play();
    }
}
</script>

<style scoped>
.chart-item {
    @apply bg-base-200 dark:bg-base-900 blur-none relative rounded-md overflow-hidden transition-all cursor-pointer text-left p-2 grid grid-cols-[auto_1fr] gap-4 items-center;

    &.playing {
        @apply bg-brand-100 dark:bg-brand-950 border border-brand-400 dark:border-brand-700;
    }

    &.explicit {
        @apply transition-all;
        & *:not(.explicit-label) {
            @apply blur-none transition-all;
        }
        & .explicit-label {
            @apply opacity-0 transition-all;
        }

        & .explicit-label {
            @apply absolute inset-0 flex items-center justify-center pointer-events-none opacity-0;
        }
        &:not(:hover) {
            & *:not(.explicit-label) {
                @apply blur-xl;
            }
            & .explicit-label {
                @apply opacity-100;
            }
        }
    }

    & .cover-container {
        @apply relative;
    }

    & .cover {
        @apply aspect-square w-[80px] rounded bg-center bg-cover;
    }

    & .play-button {
        @apply absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity rounded;

        &:hover {
            @apply bg-black/70;
        }

        & .icon {
            @apply text-white text-3xl drop-shadow-[0_0_10px_rgba(100,235,160,0.9)];
        }
    }

    &:hover .play-button,
    &.playing .play-button {
        @apply opacity-100;
    }
    & .content {
        @apply flex flex-col gap-3 overflow-hidden;

        & .meta {
            @apply flex flex-col overflow-hidden;

            & h2 {
                @apply mb-[-3px] line-clamp-1;
            }
            & p {
                @apply text-base-600 dark:text-base-400 line-clamp-1;
            }
        }
        & .info {
            @apply flex flex-wrap gap-2;

            & .installation-status {
                @apply text-xs py-0.5 px-1.5 rounded;

                &.local {
                    @apply bg-cyan-800 text-green-50;
                }
                &.installed {
                    @apply bg-green-800 text-green-50;
                }
                &.update {
                    @apply bg-purple-800 text-purple-50;
                }
            }

            & .difficulties {
                @apply flex flex-wrap gap-1 items-center;

                & .difficulty {
                    @apply flex items-center gap-1 opacity-40 text-xs py-0.5 px-1.5 rounded;

                    & span:nth-child(1) {
                        @apply font-bold;
                    }
                    &.active {
                        @apply opacity-100 bg-base-400 dark:bg-base-950;
                    }
                }
            }
        }
    }

    &:hover {
        @apply bg-base-300 dark:bg-base-800;
    }

    &.local-chart {
        @apply bg-transparent border border-base-300 dark:border-base-800 cursor-default;
    }

    &.mini {
        @apply p-2 py-1 gap-2;

        & .cover {
            @apply w-[40px];
        }
    }
}
</style>
