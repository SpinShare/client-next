<template>
    <section class="page-chart-detail">
        <h1>Chart Detail</h1>
        {{ chart }}
        <hr />
        {{ chart.tags }}
        <hr />
        {{ chart.views }}
        <hr />
        {{ chart.downloads }}
        <hr />
        {{ chart.uploadDate }}
        <hr />
        {{ chart.updateDate }}
        <hr />
        {{ chart.description }}
    </section>
</template>

<script setup>
import { inject, ref } from 'vue';

defineProps({
    chart: {
        type: Object,
        default: null,
    },
});
</script>

<style scoped>
@reference "@/assets/css/app.css";

.page-chart-detail {
    @apply p-10 flex flex-col gap-10;
}
</style>
