<template>
    <a
        :href="videoUrl"
        class="spin-play-item"
    >
        <div
            class="thumbnail"
            :style="`background-image: url('${videoThumbnail}')`"
        >
            <div class="overlay">
                <Remixicon
                    icon="play"
                    size="5xl"
                    filled
                />
            </div>
        </div>

        <UserItem v-bind="user" />
    </a>
</template>

<script setup>
import UserItem from '@/components/UserItem.vue';
import Remixicon from '@/components/Remixicon.vue';

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
        @apply bg-cover bg-center aspect-video w-full relative;

        & .overlay {
            @apply transition-all flex items-center justify-center absolute inset-0 opacity-0;
            background: rgba(0, 0, 0, 0.6);
        }

        &:hover {
            & .overlay {
                @apply opacity-100;
            }
        }
    }
}
</style>
