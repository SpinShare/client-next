<template>
    <section class="promo-item">
        <div
            class="banner"
            :style="`background-image: url('${image_path}')`"
        ></div>
        <div class="content">
            <h5>{{ type }}</h5>
            <h1>{{ strippedTitle }}</h1>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    button: {
        type: Object,
        required: true,
    },
    image_path: {
        type: String,
        required: true,
    },
});

// Legacy titles include HTML, we're stripping it
function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}
const strippedTitle = computed(() => stripHtml(props.title));
</script>

<style>
@reference "@/assets/css/app.css";

.promo-item {
    @apply bg-base-800 rounded overflow-hidden transition-all cursor-pointer;

    & .banner {
        @apply bg-cover bg-center;
        height: 200px;
    }
    & .content {
        @apply flex flex-col p-4;

        & h5 {
            @apply text-sm font-bold text-base-500;
        }
        & h1 {
            @apply text-xl;
        }
    }

    &:hover {
        @apply bg-base-700;

        & .content {
            & h5 {
                @apply text-base-400;
            }
        }
    }
}
</style>
