<template>
    <div class="card-item">
        <img
            :src="icon"
            alt="Card Image"
            class="card-img"
            ref="cardImage"
        />
        <div class="meta">
            <h1>{{ title }}</h1>
            <p>{{ cleanDescription }}</p>
            <div class="given-date">{{ givenDateAbsolute }}</div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { TZDate } from '@date-fns/tz';
import VanillaTilt from 'vanilla-tilt';

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

const cardImage = ref(null);

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

const cleanDescription = computed(() => {
    return props.description.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
});

onMounted(() => {
    VanillaTilt.init(cardImage.value, { max: 20, speed: 400, scale: '1.25', reverse: true, perspective: 1000 });
});
</script>

<style scoped>
.card-item {
    @apply overflow-hidden transition-all p-5 border border-base-300 dark:border-base-800 rounded-md grid grid-cols-[100px_1fr] gap-5;

    & .meta {
        @apply flex flex-col gap-0.5;

        & h1 {
            @apply font-bold;
        }
        & .given-date {
            @apply mt-2 text-sm text-base-500 dark:text-base-300;
        }
    }
}
</style>
