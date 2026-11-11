<template>
    <LayoutBase>
        <template v-if="!library">
            <section class="section-center">
                <Loader />
            </section>
        </template>
        <template v-else>
            <section class="page-library">
                <SectionHeader :title="$t('library.header')">
                    <button
                        v-if="outdatedCharts?.length"
                        class="button brand"
                        @click="handleUpdateAll"
                        v-interactable
                    >
                        <Remixicon icon="download" />
                        <span>{{ $t('library.updateAll', { count: outdatedCharts.length }) }}</span>
                    </button>
                    <button
                        class="button"
                        @click="handleOpen"
                        v-interactable
                    >
                        <Remixicon icon="folder-open" />
                        <span>{{ $t('library.open') }}</span>
                    </button>
                    <button
                        class="button"
                        @click="handleRebuild"
                        v-interactable
                    >
                        <Remixicon icon="refresh" />
                        <span>{{ $t('library.rebuild') }}</span>
                    </button>
                </SectionHeader>
                <template v-if="library.length === 0">
                    <EmptyState
                        :label="$t('library.noCharts')"
                        icon="music-2"
                    />
                </template>
                <template v-else>
                    <ChartGrid>
                        <ChartItem
                            v-for="chart in library"
                            :key="chart.fileReference"
                            v-bind="chart"
                            :update-hash="remoteUpdateHashes[chart.fileReference] || ''"
                            :is-local="true"
                        />
                    </ChartGrid>
                </template>
            </section>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import Loader from '@/components/Loader.vue';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import EmptyState from '@/components/EmptyState.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Remixicon from '@/components/Remixicon.vue';
import ChartGrid from '@/components/Charts/ChartGrid.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';
import { DownloadItem } from '../../../main/queue/downloadQueueItem';

const library = ref(null);
const remoteUpdateHashes = ref({});
const outdatedCharts = computed(() => library?.value.filter(isChartOutdated));
const settingsManager = inject('settingsManager');
const api = inject('api');
const externalApi = inject('externalApi');
const libraryManager = inject('libraryManager');
const mitt = inject('mitt');
const queue = inject('queue');

onMounted(async () => {
    mitt.on('cache-change', onCacheChange);
    library.value = await libraryManager.getAll();
    remoteUpdateHashes.value = await libraryManager.getRemoteUpdateHashes();
});

onUnmounted(() => {
    mitt.off('cache-change');
});

function onCacheChange(cacheItems) {
    library.value = cacheItems;
}

async function handleOpen() {
    let libraryPath = await settingsManager.get('pathCustoms');
    await externalApi.openFolder(libraryPath);
}

function handleRebuild() {
    libraryManager.rebuild();
}

function isChartOutdated(chart) {
    return chart.fileReference.startsWith('spinshare_') && chart.updateHash !== remoteUpdateHashes?.value[chart.fileReference];
}

function handleUpdateAll() {
    for (const chart of outdatedCharts.value) {
        handleAddToQueue(chart);
    }
}

async function handleAddToQueue(chart) {
    const chartDetail = await api.getChartDetail(chart.fileReference);
    if (chartDetail === null) return;

    const newDownloadItem = new DownloadItem(chartDetail.id, chartDetail.cover, chartDetail.title, chartDetail.artist, chartDetail.charter, chartDetail.fileReference, false);
    await queue.addQueueItem(newDownloadItem);
}
</script>

<style scoped>
.page-library {
    @apply p-10 flex flex-col gap-5;
}
</style>
