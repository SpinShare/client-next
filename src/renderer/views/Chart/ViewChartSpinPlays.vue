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
        <EmptyState
            v-if="spinPlays.length === 0"
            label="No SpinPlays yet."
            icon="youtube"
        />
        <SpinPlaysGrid v-else>
            <SpinPlayItem
                v-for="spinPlay in spinPlays"
                :key="spinPlay.id"
                v-bind="spinPlay"
                :show-user="true"
            />
        </SpinPlaysGrid>
    </section>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SpinPlayItem from '@/components/SpinPlays/SpinPlayItem.vue';
import Loader from '@/components/Loader.vue';
import SpinPlaysGrid from '@/components/SpinPlays/SpinPlaysGrid.vue';
import EmptyState from '@/components/EmptyState.vue';

const api = inject('api');
const route = useRoute();
const chartId = route.params.chartId;
const spinPlays = ref(null);

onMounted(async () => {
    spinPlays.value = (await api.getChartSpinPlays(chartId))?.spinPlays || [];
});
</script>

<style scoped>
.page-chart-spin-plays {
    @apply p-10;
}
</style>
