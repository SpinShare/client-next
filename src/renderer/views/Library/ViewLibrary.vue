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
import { inject, onMounted, onUnmounted, ref } from 'vue';
import EmptyState from '@/components/EmptyState.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Remixicon from '@/components/Remixicon.vue';
import ChartGrid from '@/components/Charts/ChartGrid.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';

const library = ref(null);
const settingsManager = inject('settingsManager');
const externalApi = inject('externalApi');
const libraryManager = inject('libraryManager');
const mitt = inject('mitt');

onMounted(async () => {
    mitt.on('cache-change', onCacheChange);
    library.value = await libraryManager.getAll();
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
</script>

<style scoped>
.page-library {
    @apply p-10 flex flex-col gap-5;
}
</style>
