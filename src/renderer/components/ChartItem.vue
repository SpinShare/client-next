<template>
    <RouterLink
        :to="`/chart/${id}`"
        :class="`chart-item ${isExplicit ? 'explicit' : ''}`"
    >
        <div
            class="cover"
            :style="`background-image: url('${cover}')`"
        ></div>
        <div class="content">
            <div class="meta">
                <h2>{{ title }}</h2>
                <p>{{ artist }} &bull; {{ charter }}</p>
            </div>
            <div class="info">
                <!--
                    <div class="installation-status installed">Installed</div>
                    <div class="installation-status update">Update</div>
                -->
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
        </div>
        <div class="explicit-label" v-if="isExplicit">Explicit Content &ndash; Hover to reveal</div>
    </RouterLink>
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
</script>

<style scoped>
@reference "@/assets/css/app.css";

.chart-item {
    @apply bg-base-900 blur-none relative rounded-md overflow-hidden transition-all cursor-pointer text-left p-2 grid grid-cols-[auto_1fr] gap-4 items-center;

    &.explicit {
        & .explicit-label {
            @apply absolute inset-0 flex items-center justify-center pointer-events-none opacity-0;
        }
        &:not(:hover) {
            & *:not(.explicit-label) {
                @apply blur-xl;
            }
            & .explicit-label {
                @apply opacity-100;
            }
        }
    }

    & .cover {
        @apply aspect-square w-[80px] rounded bg-center bg-cover;
    }
    & .content {
        @apply flex flex-col gap-3;

        & .meta {
            @apply flex flex-col;

            & h2 {
                @apply text-lg mb-[-3px] line-clamp-1;
            }
            & p {
                @apply text-base-400 line-clamp-1;
            }
        }
        & .info {
            @apply flex flex-wrap gap-2;

            & .installation-status {
                @apply text-xs py-0.5 px-1.5 rounded;

                &.installed {
                    @apply bg-green-800 text-green-50;
                }
                &.update {
                    @apply bg-purple-800 text-purple-50;
                }
            }

            & .difficulties {
                @apply flex flex-wrap gap-1 items-center;

                & .difficulty {
                    @apply flex items-center gap-1 opacity-40 text-xs py-0.5 px-1.5 rounded;

                    & span:nth-child(1) {
                        @apply font-bold;
                    }
                    &.active {
                        @apply opacity-100 bg-base-950;
                    }
                }
            }
        }
    }

    &:hover {
        @apply bg-base-800;
    }
}
</style>
