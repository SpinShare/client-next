<template>
    <LayoutBase>
        <template v-if="!chart">
            <section class="section-center">
                <Loader />
            </section>
        </template>
        <template v-else>
            <audio
                ref="chartPreview"
                :src="chart.paths.ogg"
            />

            <header class="chart">
                <div
                    class="cover"
                    :style="`background-image: url('${chart.cover}')`"
                ></div>
                <div class="content">
                    <div class="meta">
                        <h1>{{ chart.title }}</h1>
                        <h2>{{ chart.subtitle }}</h2>
                        <p>{{ chart.artist }} &bull; {{ chart.charter }}</p>
                    </div>
                    <div class="info">
                        <div class="installation-status installed" v-if="cacheItem?.updateHash === chart.updateHash">Installed</div>
                        <div class="installation-status update" v-if="cacheItem?.updateHash && cacheItem?.updateHash !== chart.updateHash">Out of date</div>
                        <div class="difficulties">
                            <div :class="`difficulty ${chart.hasEasyDifficulty ? 'active' : ''}`">
                                <span>E</span>
                                <span v-if="chart.hasEasyDifficulty">{{ chart.easyDifficulty }}</span>
                            </div>
                            <div :class="`difficulty ${chart.hasNormalDifficulty ? 'active' : ''}`">
                                <span>N</span>
                                <span v-if="chart.hasNormalDifficulty">{{ chart.normalDifficulty }}</span>
                            </div>
                            <div :class="`difficulty ${chart.hasHardDifficulty ? 'active' : ''}`">
                                <span>H</span>
                                <span v-if="chart.hasHardDifficulty">{{ chart.hardDifficulty }}</span>
                            </div>
                            <div :class="`difficulty ${chart.hasExtremeDifficulty ? 'active' : ''}`">
                                <span>EX</span>
                                <span v-if="chart.hasExtremeDifficulty">{{ chart.expertDifficulty }}</span>
                            </div>
                            <div :class="`difficulty ${chart.hasXDDifficulty ? 'active' : ''}`">
                                <span>XD</span>
                                <span v-if="chart.hasXDDifficulty">{{ chart.XDDifficulty }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button
                            class="button brand"
                            @click="handlePlay"
                            v-interactable
                            v-if="cacheItem"
                        >
                            <Remixicon icon="gamepad" />
                            <span>Play</span>
                        </button>
                        <button
                            class="button brand"
                            @click="handleAddToQueue"
                            v-interactable
                        >
                            <Remixicon icon="download" />
                            <span>Add to queue</span>
                        </button>
                        <template v-if="chartPreview">
                            <button
                                class="button"
                                v-if="!isPreviewPlaying"
                                @click="playPreview"
                                v-interactable
                            >
                                <Remixicon
                                    icon="play"
                                    filled
                                />
                            </button>
                            <button
                                class="button"
                                v-if="isPreviewPlaying"
                                @click="stopPreview"
                                v-interactable
                            >
                                <Remixicon
                                    icon="stop"
                                    filled
                                />
                            </button>
                        </template>
                        <button
                            class="button"
                            @click="handleOpenUrl"
                            v-interactable
                        >
                            <Remixicon
                                icon="external-link"
                                filled
                            />
                        </button>
                        <button
                            class="button"
                            @click="handleOpenReport"
                            v-interactable
                        >
                            <Remixicon
                                icon="flag-2"
                                filled
                            />
                        </button>
                    </div>
                </div>
            </header>
            <nav>
                <TabList>
                    <TabItemLink
                        :to="`/chart/${chartId}`"
                        label="Detail"
                    />
                    <TabItemLink
                        :to="`/chart/${chartId}/reviews`"
                        label="Reviews"
                    />
                    <TabItemLink
                        :to="`/chart/${chartId}/playlists`"
                        label="Playlists"
                    />
                    <TabItemLink
                        :to="`/chart/${chartId}/spinplays`"
                        label="SpinPlays"
                    />
                </TabList>
            </nav>
            <main>
                <router-view :key="route.fullPath" :chart="chart" />
            </main>

            <dialog class="play-dialog" ref="playDialog">
                <section class="copy">
                    <SectionHeader title="Play" />
                    <p>Select a difficulty to start Spin Rhythm XD and immediately play <strong>{{ chart.title }}</strong>.</p>
                </section>

                <section class="options">
                    <button
                        class="button"
                        :disabled="!chart.hasEasyDifficulty"
                        @click="() => handlePlayDifficulty(0)"
                        v-interactable
                    >
                        <span>{{ chart.easyDifficulty ?? "n/a" }}</span>
                        <span>Easy</span>
                    </button>
                    <button
                        class="button"
                        :disabled="!chart.hasNormalDifficulty"
                        @click="() => handlePlayDifficulty(1)"
                        v-interactable
                    >
                        <span>{{ chart.normalDifficulty ?? "n/a" }}</span>
                        <span>Normal</span>
                    </button>
                    <button
                        class="button"
                        :disabled="!chart.hasHardDifficulty"
                        @click="() => handlePlayDifficulty(2)"
                        v-interactable
                    >
                        <span>{{ chart.hardDifficulty ?? "n/a" }}</span>
                        <span>Hard</span>
                    </button>
                    <button
                        class="button"
                        :disabled="!chart.hasExtremeDifficulty"
                        @click="() => handlePlayDifficulty(3)"
                        v-interactable
                    >
                        <span>{{ chart.expertDifficulty ?? "n/a" }}</span>
                        <span>Expert</span>
                    </button>
                    <button
                        class="button"
                        :disabled="!chart.hasXDDifficulty"
                        @click="() => handlePlayDifficulty(4)"
                        v-interactable
                    >
                        <span>{{ chart.XDDifficulty ?? "n/a" }}</span>
                        <span>XD</span>
                    </button>
                </section>

                <section class="actions">
                    <button
                        class="button brand"
                        @click="handleClosePlay"
                        v-interactable
                    >
                        <Remixicon icon="close" />
                        <span>Close</span>
                    </button>
                </section>
            </dialog>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { useRoute } from 'vue-router';
import {inject, onMounted, onUnmounted, ref, watch} from 'vue';
import TabList from '@/components/Tabs/TabList.vue';
import TabItemLink from '@/components/Tabs/TabItemLink.vue';
import Remixicon from '@/components/Remixicon.vue';
import Loader from '@/components/Loader.vue';
import { DownloadItem } from '../../main/queue/downloadQueueItem';
import SectionHeader from "@/components/SectionHeader.vue";

const mitt = inject('mitt');
const api = inject('api');
const externalApi = inject('externalApi');
const libraryManager = inject('libraryManager');
const queue = inject('queue');
const route = useRoute();
const chartId = ref(route.params.chartId);
const chart = ref(null);
const cacheUpdateHash = ref(null);
const cacheItem = ref(null);

const chartPreview = ref(null);
const chartPreviewTimeout = ref(null);
const isPreviewPlaying = ref(false);

const playDialog = ref(null);

onMounted(async () => {
    chart.value = await api.getChartDetail(chartId.value);
    cacheItem.value = await libraryManager.get(chart.value.fileReference);
    mitt.on('item-change', async (queueItem) => {
        if(queueItem.id !== chart.value.id) return;
        cacheItem.value = await libraryManager.get(queueItem.fileReference);
    });
});

onUnmounted(() => {
    stopPreview();
    mitt.off('item-change');
});

function handlePlay() {
    playDialog.value.showModal();
}
function handleClosePlay() {
    playDialog.value.close();
}
function handlePlayDifficulty(difficulty) {
    externalApi.openUrl(`steam://run/1058830//play "${cacheItem.value.srtbPath}" difficulty ${difficulty}`);

    setTimeout(() => {
        handleClosePlay();
    }, 500);
}

async function handleAddToQueue() {
    const newDownloadItem = new DownloadItem(chart.value.id, chart.value.cover, chart.value.title, chart.value.artist, chart.value.charter, chart.value.fileReference);
    await queue.addQueueItem(newDownloadItem);
}

function handleOpenUrl() {
    externalApi.openUrl(`https://spinsha.re/song/${chart.value.id}`);
}

function handleOpenReport() {
    externalApi.openUrl(`https://spinsha.re/report/song/${chart.value.id}`);
}

function playPreview() {
    if (chartPreview.value) {
        chartPreview.value.currentTime = 0;
        chartPreview.value.volume = 0.5;
        chartPreview.value.play();
        isPreviewPlaying.value = true;

        chartPreviewTimeout.value = setTimeout(() => {
            stopPreview();
        }, 30 * 1000);
    }
}

function stopPreview() {
    if (chartPreview.value) {
        chartPreview.value.pause();
        chartPreview.value.currentTime = 0;
        isPreviewPlaying.value = false;
        clearTimeout(chartPreviewTimeout.value);
    }
}

watch(() => [route.params.chartId], async () => {
    chartId.value = route.params.chartId;
    chart.value = await api.getChartDetail(chartId.value);
    cacheItem.value = await libraryManager.get(chart.value.fileReference);
});
</script>

<style scoped>
header.chart {
    @apply p-10 flex flex-col gap-4;

    & .cover {
        @apply aspect-square w-[172px] rounded bg-center bg-cover;
    }
    & .content {
        @apply flex flex-col gap-3;

        & .meta {
            @apply flex flex-col;

            & h1 {
                @apply text-lg mb-[-3px] line-clamp-1;
            }
            & h2 {
                @apply text-base-500 dark:text-base-300 line-clamp-1;
            }
            & p {
                @apply text-base-500 dark:text-base-300 line-clamp-1;
            }
        }
        & .info {
            @apply flex flex-wrap gap-2;

            & .installation-status {
                @apply text-xs py-0.5 px-1.5 rounded;

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
                        @apply opacity-100 bg-base-200 dark:bg-base-900;
                    }
                }
            }
        }
        & .actions {
            @apply flex flex-wrap gap-2 mt-2;
        }
    }
}

.play-dialog:open {
    @apply bg-base-900 text-base-100 w-full max-w-[500px] m-auto rounded-md p-10 flex flex-col gap-4 transition-all;

    @starting-style {
        @apply opacity-0;
    }

    &::backdrop {
        @apply fixed inset-0 p-5 flex flex-col justify-center items-center z-100 backdrop-blur-md backdrop-brightness-75 transition-all;

        @starting-style {
            @apply opacity-0;
        }
    }

    & .copy {
        @apply flex flex-col gap-2;

        & h1 {
            @apply text-xl;
        }
        & p {
            @apply text-base-500 dark:text-base-300;
        }
    }

    & .options {
        @apply grid grid-cols-5 gap-2;

        & .button {
            @apply flex-col h-auto gap-0.5 items-center justify-center py-2 bg-base-800;

            & span:nth-child(1) {
                @apply text-2xl font-bold;
            }
            & span:nth-child(2) {
                @apply text-base-500 dark:text-base-300;
            }

            &:not(:disabled):hover {
                @apply bg-base-700;
            }
        }
    }

    & .actions {
        @apply flex justify-end;
    }
}
nav {
    @apply sticky top-0 z-5  bg-base-50 dark:bg-base-950;
}

@media screen and (min-width: 1100px) {
    header.chart {
        @apply grid grid-cols-[auto_1fr] items-center;
    }
}
</style>
