<template>
    <section class="page-user-charts">
        <div
            class="no-charts"
            v-if="charts.length === 0"
        >
            <Remixicon
                icon="award"
                size="3xl"
                filled
            />
            <span>No charts yet.</span>
        </div>
        <ChartGrid>
            <ChartItem
                v-for="chart in charts"
                :key="chart.id"
                v-bind="chart"
            />
        </ChartGrid>
    </section>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import ChartGrid from '@/components/ChartGrid.vue';
import ChartItem from '@/components/ChartItem.vue';
import { onMounted, ref, inject } from 'vue';
import { useRoute } from 'vue-router';

const api = inject('api');
const route = useRoute();
const userId = route.params.userId;
const charts = ref([]);

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

    & .no-charts {
        @apply flex flex-col items-center gap-1 py-5 text-base-400 border border-base-800 rounded-md;
    }
}
</style>
