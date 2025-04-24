<template>
    <div class="card-item">
        <img
            :src="icon"
            alt="Card Image"
            class="card-img"
        />
        <div class="meta">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <div class="given-date">{{ givenDateAbsolute }}</div>
        </div>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import { computed } from 'vue';
import { TZDate } from '@date-fns/tz';

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    givenDate: {
        type: Object,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const parseDateWithTimezone = ({ date, timezone }) => {
    const [year, month, day, hours, minutes, seconds] = date
        .replace(/\.\d+$/, '') // Remove milliseconds
        .split(/[- :]/)
        .map(Number);

    // Create TZDate using timezone
    return new TZDate(year, month - 1, day, hours, minutes, seconds, timezone); // Months are 0-indexed
};

const givenDateAbsolute = computed(() => {
    let date = parseDateWithTimezone(props.givenDate);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
});
</script>

<style scoped>
.card-item {
    @apply overflow-hidden transition-all p-5 border border-base-800 rounded-md grid grid-cols-[100px_1fr] gap-5;

    & .meta {
        @apply flex flex-col gap-0.5;

        & h1 {
            @apply font-bold;
        }
        & .given-date {
            @apply mt-2 text-sm text-base-400;
        }
    }
}
</style>
