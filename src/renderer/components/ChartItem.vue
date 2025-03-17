<template>
    <button
        class="chart-item"
        @click="handleClick"
    >
        <div
            class="cover"
            :style="`background-image: url('${cover}')`"
        ></div>
        <div class="content">
            <div class="meta">
                <h1>{{ title }}</h1>
                <p>{{ artist }}</p>
            </div>
            <div class="difficulties">
                <div :class="`difficulty ${hasEasyDifficulty ? 'active' : ''}`">
                    <span>E</span>
                    <span v-if="hasEasyDifficulty">{{ easyDifficulty }}</span>
                </div>
                <div :class="`difficulty ${hasNormalDifficulty ? 'active' : ''}`">
                    <span>N</span>
                    <span v-if="hasNormalDifficulty">{{ normalDifficulty }}</span>
                </div>
                <div :class="`difficulty ${hasHardDifficulty ? 'active' : ''}`">
                    <span>H</span>
                    <span v-if="hasHardDifficulty">{{ hardDifficulty }}</span>
                </div>
                <div :class="`difficulty ${hasExtremeDifficulty ? 'active' : ''}`">
                    <span>EX</span>
                    <span v-if="hasExtremeDifficulty">{{ expertDifficulty }}</span>
                </div>
                <div :class="`difficulty ${hasXDDifficulty ? 'active' : ''}`">
                    <span>XD</span>
                    <span v-if="hasXDDifficulty">{{ XDDifficulty }}</span>
                </div>
            </div>
        </div>
    </button>
</template>

<script setup>
const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: [String, Boolean],
        default: false,
    },
    artist: {
        type: String,
        required: true,
    },
    charter: {
        type: String,
        required: true,
    },
    isExplicit: {
        type: Boolean,
        default: false,
    },
    hasEasyDifficulty: {
        type: Boolean,
        default: false,
    },
    hasNormalDifficulty: {
        type: Boolean,
        default: false,
    },
    hasHardDifficulty: {
        type: Boolean,
        default: false,
    },
    hasExtremeDifficulty: {
        type: Boolean,
        default: false,
    },
    hasXDDifficulty: {
        type: Boolean,
        default: false,
    },
    easyDifficulty: {
        type: Number,
        default: 0,
    },
    normalDifficulty: {
        type: Number,
        default: 0,
    },
    hardDifficulty: {
        type: Number,
        default: 0,
    },
    expertDifficulty: {
        type: Number,
        default: 0,
    },
    XDDifficulty: {
        type: Number,
        default: 0,
    },
    cover: {
        type: [String, Boolean],
        default: false,
    },
});

function handleClick() {
    // TODO: Handle Click
    console.log('TODO');
}
</script>

<style>
@reference "@/assets/css/app.css";

.chart-item {
    @apply bg-base-800 rounded-md overflow-hidden transition-all cursor-pointer text-left p-4 grid grid-cols-[auto_1fr] gap-4 items-center;

    & .cover {
        @apply aspect-square w-[64px] rounded;
    }
    & .content {
        @apply flex flex-col gap-1;

        & .meta {
        }
        & .difficulties {
            @apply flex flex-wrap gap-1 items-center bg-base-900 p-2 rounded;

            & .difficulty {
                @apply flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-base-800;
            }
        }
    }

    &:hover {
        @apply bg-base-700;
    }
}
</style>
