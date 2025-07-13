<template>
    <RouterLink
        :to="`/chart/${id}`"
        :class="`review-item`"
        v-interactable
    >
        <div class="review">
            <p v-if="comment">{{ comment }}</p>
            <p
                v-else
                class="no-comment"
            >
                <Remixicon icon="chat-off" size="md" />
                <span>No comment.</span>
            </p>
            <div
                class="badge-recommended"
                v-if="recommended"
            >
                <Remixicon
                    icon="thumb-up"
                    filled
                    size="sm"
                />
                <span>Recommended</span>
            </div>
        </div>
        <UserItem
            :mini="true"
            v-if="showUser"
            v-bind="user"
        />
        <ChartItem
            :mini="true"
            v-if="showChart"
            v-bind="song"
        />
    </RouterLink>
</template>

<script setup>
import ChartItem from '@/components/Charts/ChartItem.vue';
import UserItem from '@/components/Users/UserItem.vue';
import Remixicon from '@/components/Remixicon.vue';

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    showUser: {
        type: Boolean,
        default: false,
    },
    showChart: {
        type: Boolean,
        default: false,
    },
    song: {
        type: Object,
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
    recommended: {
        type: Boolean,
        default: false,
    },
    reviewDate: {
        type: Object,
        required: true,
    },
    comment: {
        type: [String, Boolean],
        default: false,
    },
});
</script>

<style scoped>
.review-item {
    @apply bg-base-200 dark:bg-base-900 rounded-md overflow-hidden transition-all cursor-pointer p-2 flex flex-col gap-2;

    & .review {
        @apply grow p-2 flex flex-col gap-2;

        & .badge-recommended {
            @apply text-sm px-2 py-0.25 rounded-full bg-emerald-700 text-emerald-50 self-start flex gap-1 items-center;
        }
        & p {
            @apply grow;

            &.no-comment {
                @apply text-base-600 dark:text-base-300 flex gap-1.5 items-center;
            }
        }
    }
}
</style>
