<template>
    <section class="user-detail-tab-reviews">
        <div
            class="reviews-list"
            v-if="reviews"
        >
            <ReviewItem
                v-for="review in reviews"
                :key="review.id"
                v-bind="review"
            />
        </div>
        <SpinLoader v-else />
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserReviews } from '@/api/api';
import ReviewItem from '@/components/Chart/Detail/ReviewItem.vue';

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const reviews = ref(null);

onMounted(async () => {
    reviews.value = await getUserReviews(props.id);
});
</script>

<style lang="scss" scoped>
.user-detail-tab-reviews {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    & .reviews-list {
        display: grid;
        gap: 15px;
    }
}
</style>
