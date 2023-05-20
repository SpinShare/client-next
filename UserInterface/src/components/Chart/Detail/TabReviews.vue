<template>
    <section class="chart-detail-tab-reviews">
        <div class="reviews-list" v-if="reviews">
            <ReviewItem
                v-for="review in reviews.reviews"
                :key="review.id"
                v-bind="review"
            />
        </div>
        <SpinLoader v-else />
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getChartReviews } from "@/api/api";
import ReviewItem from "@/components/Chart/Detail/ReviewItem.vue";

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const reviews = ref([]);

onMounted(async () => {
    reviews.value = await getChartReviews(props.id);
});
</script>

<style lang="scss" scoped>
.chart-detail-tab-reviews {
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 25px;
    
    & .reviews-list {
        display: grid;
        gap: 15px;
    }
}
</style>