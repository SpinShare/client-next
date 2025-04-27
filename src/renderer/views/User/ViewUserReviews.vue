<template>
    <section
        class="section-center py-30"
        v-if="!reviews"
    >
        <Loader />
    </section>
    <section
        class="page-user-reviews"
        v-else
    >
        <EmptyState
            v-if="reviews.length === 0"
            label="No reviews yet."
            icon="chat-smile-2"
        />
        <ReviewGrid v-else>
            <ReviewItem
                v-for="review in reviews"
                :key="review.id"
                v-bind="review"
                :show-chart="true"
            />
        </ReviewGrid>
    </section>
</template>

<script setup>
import Loader from '@/components/Loader.vue';
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Remixicon from '@/components/Remixicon.vue';
import ReviewGrid from '@/components/Reviews/ReviewGrid.vue';
import ReviewItem from '@/components/Reviews/ReviewItem.vue';
import EmptyState from '@/components/EmptyState.vue';

const api = inject('api');
const route = useRoute();
const userId = route.params.userId;
const reviews = ref(null);

const props = defineProps({
    user: {
        type: Object,
        default: null,
    },
});

onMounted(async () => {
    reviews.value = await api.getUserReviews(userId);
});
</script>

<style scoped>
.page-user-reviews {
    @apply p-10;
}
</style>
