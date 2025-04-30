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

            <header>
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
                        <!--
                            <div class="installation-status installed">Installed</div>
                            <div class="installation-status update">Update</div>
                        -->
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
                            @click="handleAddToQueue"
                        >
                            <Remixicon icon="download" />
                            <span>Add to queue</span>
                        </button>
                        <template v-if="chartPreview">
                            <button
                                class="button"
                                v-if="!isPreviewPlaying"
                                @click="playPreview"
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
                        >
                            <Remixicon
                                icon="external-link"
                                filled
                            />
                        </button>
                        <button
                            class="button"
                            @click="handleOpenReport"
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
                <router-view :chart="chart" />
            </main>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { useRoute } from 'vue-router';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import TabList from '@/components/Tabs/TabList.vue';
import TabItemLink from '@/components/Tabs/TabItemLink.vue';
import Remixicon from '@/components/Remixicon.vue';
import Loader from '@/components/Loader.vue';
import { DownloadItem } from '../../main/queue/downloadQueueItem';

const api = inject('api');
const externalApi = inject('externalApi');
const queue = inject('queue');
const route = useRoute();
const chartId = route.params.chartId;
const chart = ref(null);

const chartPreview = ref(null);
const chartPreviewTimeout = ref(null);
const isPreviewPlaying = ref(false);

onMounted(async () => {
    chart.value = await api.getChartDetail(chartId);
});

onUnmounted(() => {
    stopPreview();
});

async function handleAddToQueue() {
    const newDownloadItem = new DownloadItem(chart.value.id, chart.value.cover, chart.value.title, chart.value.artist, chart.value.charter);
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
</script>

<style scoped>
header {
    @apply p-10 grid grid-cols-[auto_1fr] gap-4 items-center;

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
                @apply text-base-300 line-clamp-1;
            }
            & p {
                @apply text-base-400 line-clamp-1;
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
                        @apply opacity-100 bg-base-950;
                    }
                }
            }
        }
        & .actions {
            @apply flex flex-wrap gap-2 mt-2;
        }
    }
}
</style>
