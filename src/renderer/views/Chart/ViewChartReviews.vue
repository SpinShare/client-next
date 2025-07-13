<template>
    <section
        class="section-center py-30"
        v-if="!reviews"
    >
        <Loader />
    </section>
    <section
        class="page-chart-reviews"
        v-else
    >
        <EmptyState
            v-if="reviews.length === 0"
            :label="$t('chart.noReviews')"
            icon="chat-smile-2"
        />
        <ReviewGrid v-else>
            <ReviewItem
                v-for="review in reviews"
                :key="review.id"
                v-bind="review"
                :show-user="true"
            />
        </ReviewGrid>
    </section>
</template>

<script setup>
import Loader from '@/components/Loader.vue';
import { inject, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ReviewGrid from '@/components/Reviews/ReviewGrid.vue';
import ReviewItem from '@/components/Reviews/ReviewItem.vue';
import EmptyState from '@/components/EmptyState.vue';

const api = inject('api');
const route = useRoute();
const chartId = route.params.chartId;
const reviews = ref(null);
const reviewAverage = ref(0);

onMounted(async () => {
    const response = await api.getChartReviews(chartId);
    reviews.value = response.reviews || [];
    reviewAverage.value = response.average;
});
</script>

<style scoped>
.page-chart-reviews {
    @apply p-10;
}
</style>
