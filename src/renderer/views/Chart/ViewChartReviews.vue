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
            class="your-review"
            v-if="isLoggedIn && profile.id !== chart.uploader"
        >
            <SectionHeader :title="$t('review.yourReview.header')" />

            <template v-if="userReview !== null && !Array.isArray(userReview)">
                <ReviewItem v-bind="userReview" />

                <div class="actions">
                    <button
                        v-interactable
                        class="button"
                        @click="openReviewOverlay"
                    >
                        <Remixicon icon="edit" />
                        <span>{{ $t('review.yourReview.actions.edit') }}</span>
                    </button>
                    <button
                        v-interactable
                        class="button brand"
                        @click="handleRemove"
                    >
                        <Remixicon icon="delete-bin" />
                        <span>{{ $t('review.yourReview.actions.remove') }}</span>
                    </button>
                </div>
            </template>
            <template v-else>
                <p class="text-base-500 dark:text-base-300">
                    {{ $t('review.yourReview.noReview') }}
                </p>

                <div class="actions">
                    <button
                        v-interactable
                        class="button"
                        @click="openReviewOverlay"
                    >
                        <Remixicon icon="edit" />
                        <span>{{ $t('review.yourReview.actions.write') }}</span>
                    </button>
                </div>
            </template>

            <ReviewOverlay
                ref="reviewOverlay"
                :chartId="chartId"
                :recommend="userReview?.recommended ?? null"
                :comment="userReview?.comment ?? ''"
                @reviewUpdated="onReviewUpdated"
            />
        </div>

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
import ReviewOverlay from "@/components/Reviews/ReviewOverlay.vue";
import SectionHeader from "@/components/SectionHeader.vue";
import Remixicon from "@/components/Remixicon.vue";

const api = inject('api');
const connect = inject('connect');
const route = useRoute();
const chartId = route.params.chartId;
const isLoggedIn = ref(false);
const profile = ref(null);
const reviewOverlay = ref(null);
const userReview = ref(null);
const userReviewRemoveLoading = ref(false);
const reviews = ref(null);
const reviewAverage = ref(0);

const props = defineProps({
    chart: {
        type: Object,
        default: null,
    },
});

onMounted(async () => {
    await loadUserReview();
    await loadReviews();
});

async function loadReviews() {
    const response = await api.getChartReviews(chartId);
    reviews.value = response.reviews || [];
    reviewAverage.value = response.average;
}

async function loadUserReview() {
    isLoggedIn.value = await connect.isLoggedIn();
    if(isLoggedIn.value) {
        profile.value = await connect.getProfile();
        userReview.value = await connect.getReview(chartId);
    }
}

function openReviewOverlay() {
    reviewOverlay.value?.open();
}

function openReviewConfirmOverlay() {
    // TODO
}

async function handleRemove() {
    userReviewRemoveLoading.value = true;
    await connect.removeReview(chartId);
    userReview.value = null;

    await loadReviews();
    userReviewRemoveLoading.value = false;
}

async function onReviewUpdated() {
    userReviewRemoveLoading.value = true;
    await loadUserReview();
    await loadReviews();
    userReviewRemoveLoading.value = false;
}
</script>

<style scoped>
.page-chart-reviews {
    @apply p-10;

    & .your-review {
        @apply flex flex-col gap-2 border border-base-300 dark:border-base-800 rounded-md p-5 m-auto max-w-2xl mb-10;

        & .actions {
            @apply flex gap-2;
        }
    }
}
</style>
