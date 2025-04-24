<template>
    <section
        class="section-center py-30"
        v-if="!spinPlays"
    >
        <Loader />
    </section>
    <section
        class="page-chart-spin-plays"
        v-else
    >
        <SpinPlayItem
            v-for="spinPlay in spinPlays"
            :key="spinPlay.id"
            v-bind="spinPlay"
        />
    </section>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SpinPlayItem from '@/components/SpinPlayItem.vue';
import Loader from '@/components/Loader.vue';

const api = inject('api');
const externalApi = inject('externalApi');
const route = useRoute();
const chartId = route.params.chartId;
const spinPlays = ref(null);

onMounted(async () => {
    spinPlays.value = (await api.getChartSpinPlays(chartId))?.spinPlays || [];
});
</script>

<style scoped>
.page-chart-spin-plays {
    @apply p-10 grid grid-cols-1 gap-2.5;
}

@media screen and (min-width: 1100px) {
    .page-chart-spin-plays {
        @apply grid-cols-2;
    }
}
@media screen and (min-width: 1300px) {
    .page-chart-spin-plays {
        @apply grid-cols-3;
    }
}
@media screen and (min-width: 1800px) {
    .page-chart-spin-plays {
        @apply grid-cols-4;
    }
}
</style>
