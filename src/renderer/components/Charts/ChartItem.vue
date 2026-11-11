<template>
    <component
        :is="isLocalChart ? 'div' : RouterLink"
        :to="`/chart/${id || fileReference}`"
        :class="`chart-item ${isExplicit && !settingShowExplicit ? 'explicit' : ''} ${mini ? 'mini' : ''} ${isLocalChart ? 'local-chart' : ''}`"
        @click.middle.prevent="handleAddToQueue"
        @nav-secondary="handleSecondary"
        :data-nav-hint-x="isLocalChart ? null : $t('bigPicture.hints.download')"
        v-interactable="!isLocalChart"
    >
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
                    v-if="!isLocalChart && cacheUpdateHash && (!updateHash || cacheUpdateHash === updateHash)"
                >
                    {{ $t('chart.status.installed') }}
                </div>
                <div
                    class="installation-status update"
                    v-if="!isLocalChart && cacheUpdateHash && updateHash && cacheUpdateHash !== updateHash"
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
                    <div :class="`difficulty ${hasExpertDifficulty ? 'active' : ''}`">
                        <span>EX</span>
                        <span v-if="hasExpertDifficulty">{{ expertDifficulty }}</span>
                    </div>
                    <div :class="`difficulty ${hasXDDifficulty ? 'active' : ''}`">
                        <span>XD</span>
                        <span v-if="hasXDDifficulty">{{ XDDifficulty }}</span>
                    </div>
                    <div
                        class="difficulty active"
                        v-if="hasRemiXDDifficulty"
                    >
                        <span>RXD</span>
                        <span>{{ remiXDDifficulty }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="explicit-label"
            v-if="isExplicit && !settingShowExplicit"
        >
            <template v-if="isBigPicture">
                <Remixicon
                    icon="eye-off"
                    size="2xl"
                />
                <span>{{ $t('bigPicture.chart.explicit') }}</span>
            </template>
            <template v-else>{{ $t('chart.explicitLabel') }}</template>
        </div>
        <transition name="popup">
            <div
                class="queued-label"
                v-if="showQueuedLabel"
            >
                <Remixicon icon="download" />
                <span>{{ $t('bigPicture.chart.queued') }}</span>
            </div>
        </transition>
    </component>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { DownloadItem } from '../../../main/queue/downloadQueueItem';
import { RouterLink } from 'vue-router';
import Remixicon from '@/components/Remixicon.vue';
import { playClickSound } from '@/modules/hoverDirective';
import { isBigPicture } from '@/modules/gamepad/state';

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
    hasExpertDifficulty: {
        type: Boolean,
        default: false,
    },
    hasXDDifficulty: {
        type: Boolean,
        default: false,
    },
    hasRemiXDDifficulty: {
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
    remiXDDifficulty: {
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
});

const mitt = inject('mitt');
const queue = inject('queue');
const settingsManager = inject('settingsManager');
const libraryManager = inject('libraryManager');
const settingShowExplicit = ref(false);
const localCoverCache = ref(null);
const cacheUpdateHash = ref(null);

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
    clearTimeout(queuedLabelTimeout);
});

const isLocalChart = computed(() => {
    return !Number.isInteger(props.id) && !props.fileReference.startsWith('spinshare_');
});

const showQueuedLabel = ref(false);
let queuedLabelTimeout = null;

// X on a controller
async function handleSecondary() {
    if (isLocalChart.value) return;
    playClickSound();
    await handleAddToQueue();
    showQueuedLabel.value = true;
    clearTimeout(queuedLabelTimeout);
    queuedLabelTimeout = setTimeout(() => {
        showQueuedLabel.value = false;
    }, 1500);
}

async function handleAddToQueue() {
    if (isLocalChart.value) return;

    const newDownloadItem = new DownloadItem(props.id, props.cover, props.title, props.artist, props.charter, props.fileReference);
    await queue.addQueueItem(newDownloadItem);
}
</script>

<style scoped>
.chart-item {
    @apply bg-base-200 dark:bg-base-900 blur-none relative rounded-md overflow-hidden transition-all cursor-pointer text-left p-2 grid grid-cols-[auto_1fr] gap-4 items-center;

    &.explicit {
        @apply transition-all;
        & > *:not(.explicit-label) {
            @apply blur-none transition-all;
        }
        & .explicit-label {
            @apply opacity-0 transition-all;
        }

        & .explicit-label {
            @apply absolute inset-0 flex items-center justify-center pointer-events-none opacity-0;
        }
        &:not(:hover):not(:focus) {
            & > *:not(.explicit-label) {
                @apply blur-xl;
            }
            & .explicit-label {
                @apply opacity-100;
            }
        }
    }

    & .cover {
        @apply aspect-square w-[80px] rounded bg-center bg-cover;
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

    & .queued-label {
        @apply absolute top-2 right-2 flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50 shadow-lg pointer-events-none;
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

:root.big-picture .chart-item:not(.mini) {
    @apply flex flex-col items-stretch gap-0 p-2 rounded-lg;
    transition:
        transform 0.15s ease,
        background-color 0.15s ease;

    & .cover {
        @apply w-full h-auto rounded-md;
    }
    & .content {
        @apply gap-2 px-1 pt-2.5 pb-1;

        & .meta h2 {
            @apply font-semibold;
        }
        & .meta p {
            @apply text-sm;
        }
        & .info .difficulties .difficulty {
            @apply px-1;
        }
        & .info .difficulties .difficulty:not(.active) {
            @apply hidden;
        }
    }

    &:focus {
        @apply bg-base-300 dark:bg-base-800;
        transform: scale(1.04);
    }

    & .explicit-label {
        @apply flex-col gap-2 px-4 text-center font-semibold text-base-700 dark:text-base-200;
    }
}
</style>
