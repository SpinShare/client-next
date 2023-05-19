<template>
    <div class="chart-item">
        <div class="cover" :style="`background-image: url(${ cover })`"></div>
        <div class="meta">
            <div class="title">{{ title }}</div>
            <div class="artist">{{ artist }} &bull; {{ charter }}</div>
            <div class="difficulties">
                <span :class="{ 'active': hasEasyDifficulty }">
                    <span>E</span>
                    <span v-if="hasEasyDifficulty">{{ easyDifficulty }}</span>
                </span>
                <span :class="{ 'active': hasNormalDifficulty }">
                    <span>N</span>
                    <span v-if="hasNormalDifficulty">{{ normalDifficulty }}</span>
                </span>
                <span :class="{ 'active': hasHardDifficulty }">
                    <span>H</span>
                    <span v-if="hasHardDifficulty">{{ hardDifficulty }}</span>
                </span>
                <span :class="{ 'active': hasExtremeDifficulty }">
                    <span>EX</span>
                    <span v-if="hasExtremeDifficulty">{{ expertDifficulty }}</span>
                </span>
                <span :class="{ 'active': hasXDDifficulty }">
                    <span>XD</span>
                    <span v-if="hasXDDifficulty">{{ XDDifficulty }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    id: {
        type: Number,
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
    cover: {
        type: [String, Boolean],
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
});
</script>

<style lang="scss" scoped>
.chart-item {
    height: 85px;
    background: rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 10px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: center;
    transition: 0.15s ease-in-out all;
    
    & .cover {
        aspect-ratio: 1 / 1;
        height: 100%;
        border-radius: 4px;
        background-position: center;
        background-size: cover;
    }
    & .meta {
        display: grid;
        gap: 3px;
        
        & .artist {
            color: rgba(255,255,255,0.4);
            font-size: 14px;
        }
        & .difficulties {
            display: flex;
            gap: 5px;
            margin-top: 5px;

            & > span {
                padding: 3px 7px;
                background: rgba(255,255,255,0.07);
                border-radius: 2px;
                font-size: 10px;

                & span:nth-child(1) {
                    font-weight: bold;
                }
                & span:nth-child(2) {
                    margin-left: 5px;
                }

                &:not(.active) {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
            }
        }
    }
    
    &:hover {
        background: rgba(255,255,255,0.14);
        cursor: pointer;
    }
}
</style>