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
        <div
            class="no-reviews"
            v-if="reviews.length === 0"
        >
            <Remixicon
                icon="chat-smile-2"
                size="3xl"
                filled
            />
            <span>No reviews yet.</span>
        </div>
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
import Remixicon from '@/components/Remixicon.vue';

const api = inject('api');
const route = useRoute();
const chartId = route.params.chartId;
const reviews = ref(null);
const reviewAverage = ref(0);

onMounted(async () => {
    const response = await api.getChartReviews(chartId);
    reviews.value = response.reviews;
    reviewAverage.value = response.average;
});
</script>

<style scoped>
.page-chart-reviews {
    @apply p-10;

    & .no-reviews {
        @apply flex flex-col items-center gap-1 py-5 text-base-400 border border-base-800 rounded-md;
    }
}
</style>
