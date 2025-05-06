<template>
    <section class="page-discover-new">
        <ChartGrid>
            <template v-if="charts.length === 0">
                <ChartItemPlaceholder
                    v-for="n in 10"
                    :key="n"
                />
            </template>
            <template v-else>
                <ChartItem
                    v-for="chart in charts"
                    :key="chart.id"
                    v-bind="chart"
                />
            </template>
        </ChartGrid>

        <div class="paginator">
            <button
                class="button"
                :disabled="currentPage === 0"
                @click="handlePrevious"
                v-interactable
            >
                <Remixicon icon="arrow-left" />
                <span>Previous page</span>
            </button>
            <button
                class="button"
                @click="handleNext"
                v-interactable
            >
                <span>Next page</span>
                <Remixicon icon="arrow-right" />
            </button>
        </div>
    </section>
</template>

<script setup>
import ChartGrid from '@/components/Charts/ChartGrid.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';
import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Remixicon from '@/components/Remixicon.vue';
import ChartItemPlaceholder from '@/components/Charts/ChartItemPlaceholder.vue';

const route = useRoute();
const router = useRouter();
const currentPage = ref(Number(route.params.page) || 0);
const charts = ref([]);
const api = inject('api');

onMounted(async () => {
    let apiCharts = await api.getNewCharts(currentPage.value);
    charts.value = apiCharts?.slice(0, 10) ?? [];
});

function handlePrevious() {
    currentPage.value -= 1;
    router.push({ name: route.name, params: { ...route.params, page: currentPage.value } });
}
function handleNext() {
    currentPage.value += 1;
    router.push({ name: route.name, params: { ...route.params, page: currentPage.value } });
}
</script>

<style scoped>
.page-discover-new {
    @apply p-10 flex flex-col gap-10;

    & .paginator {
        @apply flex gap-2 items-center justify-end;
    }
}
</style>
