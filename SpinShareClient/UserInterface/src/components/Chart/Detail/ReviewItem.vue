<template>
    <div class="review-item">
        <UserItem v-if="showUser" v-bind="user" />
        <ChartItem v-if="showChart" v-bind="song" />

        <p
            v-if="comment"
            class="comment"
        >
            {{ comment }}
        </p>

        <div class="meta">
            <div
                class="tag-recommended"
                v-if="recommended"
            >
                {{ t('user.review.recommended') }}
            </div>
            <div class="review-date">
                <span class="mdi mdi-calendar-clock-outline"></span>
                <span>{{ relativeReviewDate }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import moment from 'moment';

import { useI18n } from 'vue-i18n';
import UserItem from '@/components/Common/UserItem.vue';
import ChartItem from '@/components/Common/ChartItem.vue';
const { t } = useI18n();

const props = defineProps({
    song: {
        type: Object,
        required: false,
    },
    user: {
        type: Object,
        required: true,
    },
    recommended: {
        type: Boolean,
        default: false,
    },
    comment: {
        type: [String, Boolean],
        default: false,
    },
    reviewDate: {
        type: Object,
        required: true,
    },
    showUser: {
        type: Boolean,
        default: true,
    },
    showChart: {
        type: Boolean,
        default: false,
    },
});

const relativeReviewDate = computed(() =>
    moment(props.reviewDate.date).startOf('minute').fromNow(),
);
</script>

<style lang="scss" scoped>
.review-item {
    border: 1px solid rgba(var(--colorBaseText), 0.07);
    border-radius: 6px;
    display: grid;
    grid-template-rows: auto 1fr auto;

    & .comment {
        line-height: 1.5rem;
        -webkit-user-select: text;
        -moz-user-select: text;
        user-select: text;
        cursor: text;
        padding: 15px 15px 0;
    }

    & > .meta {
        display: flex;
        gap: 10px;
        padding: 15px;
        align-items: center;

        & .review-date {
            display: flex;
            gap: 5px;
            align-items: center;
            color: rgba(var(--colorBaseText), 0.4);

            & > span:nth-child(2) {
                font-size: 0.75rem;
            }
        }

        & .tag-recommended {
            padding: 5px 10px;
            border-radius: 100px;
            font-size: 0.75rem;
            background: rgba(var(--colorSuccess), 0.2);
            color: rgba(var(--colorSuccess));
        }
    }
}
</style>
