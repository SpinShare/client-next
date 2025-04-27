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

    & .no-reviews {
        @apply flex flex-col items-center gap-1 py-5 text-base-400 border border-base-800 rounded-md;
    }
}
</style>
