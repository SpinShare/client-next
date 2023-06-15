<template>
    <section class="chart-list">
        <ChartItem
            v-for="chart in charts"
            :key="chart.id"
            v-bind="chart"
        />
    </section>
</template>

<script setup>
import ChartItem from "@/components/Common/ChartItem.vue";

defineProps({
    charts: {
        type: Array,
        default: () => [],
    }
});
</script>

<style lang="scss" scoped>
.chart-list {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr;
}

@media screen and (min-width: 1400px) {
    .chart-list {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

@media screen and (max-width: 1000px) {
    .chart-list {
        grid-template-columns: 1fr;
    }
}
</style>