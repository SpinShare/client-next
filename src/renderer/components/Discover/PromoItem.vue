<template>
    <button
        class="promo-item"
        @click="handleClick"
        v-interactable
    >
        <div
            class="banner"
            :style="`background-image: url('${image_path}')`"
        ></div>
        <div class="content">
            <h5>{{ type }}</h5>
            <h1>{{ strippedTitle }}</h1>
        </div>
    </button>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const externalApi = inject('externalApi');

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

function handleClick() {
    // Legacy behavior: Sometimes, playlists are setup as external
    let buttonType = props?.button?.type ?? 3;
    let buttonData = props?.button?.data ?? '';
    if(buttonType === 3 && props.button.data.startsWith("https://spinsha.re/playlist")) {
        buttonType = 1;
        buttonData = props.button.data.split("playlist/")[1];
    }

    let id = 0;
    if (buttonType === 0 || buttonType === 1) {
        id = parseInt(buttonData);
    }

    switch (buttonType) {
        case 0:
            // Chart Deeplink
            router.push(`/chart/${id}`);
            break;
        case 1:
            // Playlist Deeplink
            router.push(`/playlist/${id}`);
            break;
        case 2:
            // Search Deeplink
            router.push(`/discover/search?type=charts&query=${encodeURIComponent(buttonData)}`);
            break;
        case 3:
            // External
            externalApi.openUrl(buttonData);
            break;
    }
}
</script>

<style scoped>
.promo-item {
    @apply bg-base-200 dark:bg-base-900 rounded-md overflow-hidden transition-all cursor-pointer text-left;

    & .banner {
        @apply bg-cover bg-center;
        height: 200px;
    }
    & .content {
        @apply flex flex-col p-4;

        & h5 {
            @apply transition-all text-sm font-bold text-base-600 dark:text-base-500;
        }
        & h1 {
            @apply text-xl;
        }
    }

    &:hover {
        @apply bg-base-300 dark:bg-base-800;

        & .content {
            & h5 {
                @apply text-base-700 dark:text-base-300;
            }
        }
    }
}
</style>
