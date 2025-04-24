<template>
    <a
        :href="videoUrl"
        class="spin-play-item"
    >
        <div
            class="thumbnail"
            :style="`background-image: url('${videoThumbnail}')`"
        ></div>

        <div class="user">
            {{ user }}
        </div>
    </a>
</template>

<script setup>
const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    videoThumbnail: {
        type: String,
        required: true,
    },
});
</script>

<style scoped>
.spin-play-item {
    @apply bg-base-900 rounded-md overflow-hidden transition-all cursor-pointer;

    & .thumbnail {
        @apply bg-cover bg-center aspect-video w-full;
    }

    &:hover {
        @apply bg-base-800;
    }
}
</style>
