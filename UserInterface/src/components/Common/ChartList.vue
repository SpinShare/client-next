<template>
    <section class="chart-list">
        <template
            v-for="(chart, i) in charts"
            :key="chart.id"
        >
            <ChartItem
                v-bind="chart"
                :style="`animation-delay: ${0.025 * i}s`"
            />
        </template>
    </section>
</template>

<script setup>
import ChartItem from "@/components/Common/ChartItem.vue";
import {onMounted, ref} from "vue";

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
    
    & .chart-item {
        opacity: 0;
        animation: chartEntrance 0.2s ease-in-out forwards;
    }
}

@media screen and (min-width: 1400px) {
    .chart-list {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

@media screen and (min-width: 1850px) {
    .chart-list {
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
}

@media screen and (max-width: 1000px) {
    .chart-list {
        grid-template-columns: 1fr;
    }
}

@keyframes chartEntrance {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>