<template>
    <section
        class="section-center py-30"
        v-if="!charts"
    >
        <Loader />
    </section>
    <section
        class="page-user-charts"
        v-else
    >
        <EmptyState
            v-if="charts.length === 0"
            :label="$t('user.noCharts')"
            icon="music-2"
        />
        <ChartGrid>
            <ChartItem
                v-for="chart in charts"
                :key="chart.id"
                v-bind="chart"
                :chart-list="charts"
            />
        </ChartGrid>
    </section>
</template>

<script setup>
import ChartGrid from '@/components/Charts/ChartGrid.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';
import { onMounted, ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';

const api = inject('api');
const route = useRoute();
const userId = route.params.userId;
const charts = ref(null);

const props = defineProps({
    user: {
        type: Object,
        default: null,
    },
});

onMounted(async () => {
    charts.value = await api.getUserCharts(userId);
});
</script>

<style scoped>
.page-user-charts {
    @apply p-10;
}
</style>
