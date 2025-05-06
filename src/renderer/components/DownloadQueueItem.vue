<template>
    <div class="download-queue-item">
        <div
            class="cover"
            :style="`background-image: url('${cover}')`"
        ></div>
        <div class="content">
            <div class="meta">
                <h2>{{ title }}</h2>
                <p>{{ artist }} &bull; {{ charter }}</p>
            </div>
        </div>
        <div class="state">
            <button
                class="button square"
                v-if="state === 0"
                v-interactable
            >
                <Remixicon
                    icon="delete-bin"
                    size="lg"
                    @click="handleRemove"
                />
            </button>
            <Loader
                :size="22"
                :border-width="3"
                v-if="state === 1 || state === 2"
            />
            <Remixicon
                icon="check"
                size="lg"
                v-if="state === 3"
            />
            <Remixicon
                icon="error-warning"
                size="lg"
                v-if="state === 4"
            />
        </div>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import Loader from '@/components/Loader.vue';

const emits = defineEmits(['remove']);

const props = defineProps({
    id: {
        type: [String, Number],
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    charter: {
        type: String,
        required: true,
    },
    state: {
        type: Number,
        default: 0,
    },
});

function handleRemove() {
    emits('remove', props.id);
}
</script>

<style scoped>
.download-queue-item {
    @apply border border-base-800 relative transition-all text-left p-2 py-1 grid grid-cols-[auto_1fr_auto] gap-2 items-center shrink-0;

    &:first-of-type {
        @apply rounded-t-md;
    }
    &:last-of-type {
        @apply rounded-b-md;
    }
    &:not(:first-of-type) {
        @apply mt-[-1px];
    }

    & .cover {
        @apply aspect-square w-[40px] rounded bg-center bg-cover;
    }
    & .content {
        @apply flex flex-col gap-3;

        & .meta {
            @apply flex flex-col;

            & h2 {
                @apply mb-[-3px] line-clamp-1;
            }
            & p {
                @apply text-base-400 line-clamp-1;
            }
        }
    }
    & .state {
        & > .loader {
            @apply mx-2;
        }
        & > .icon {
            @apply px-2;
        }
    }
}
</style>
