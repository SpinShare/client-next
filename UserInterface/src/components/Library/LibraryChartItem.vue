<template>
    <div class="chart-item">
        <div class="cover" :style="`background-image: url(${ Cover })`"></div>
        <div class="meta">
            <div class="title">{{ Title }}</div>
            <div class="artist">{{ Artist }} &bull; {{ Charter }}</div>
            <div class="difficulties">
                <span :class="{ 'active': EasyDifficulty }">
                    <span>E</span>
                    <span v-if="EasyDifficulty">{{ EasyDifficulty }}</span>
                </span>
                <span :class="{ 'active': NormalDifficulty }">
                    <span>N</span>
                    <span v-if="NormalDifficulty">{{ NormalDifficulty }}</span>
                </span>
                <span :class="{ 'active': HardDifficulty }">
                    <span>H</span>
                    <span v-if="HardDifficulty">{{ HardDifficulty }}</span>
                </span>
                <span :class="{ 'active': ExpertDifficulty }">
                    <span>EX</span>
                    <span v-if="ExpertDifficulty">{{ ExpertDifficulty }}</span>
                </span>
                <span :class="{ 'active': XDDifficulty }">
                    <span>XD</span>
                    <span v-if="XDDifficulty">{{ XDDifficulty }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    SpinShareReference: {
        type: [String, Boolean],
        default: false,
    },
    Title: {
        type: String,
        required: true,
    },
    Artist: {
        type: String,
        required: true,
    },
    Charter: {
        type: String,
        required: true,
    },
    Cover: {
        type: [String, Boolean],
        default: false,
    },
    EasyDifficulty: {
        type: [Number, Boolean],
        default: false,
    },
    NormalDifficulty: {
        type: [Number, Boolean],
        default: false,
    },
    HardDifficulty: {
        type: [Number, Boolean],
        default: false,
    },
    ExpertDifficulty: {
        type: [Number, Boolean],
        default: false,
    },
    XDDifficulty: {
        type: [Number, Boolean],
        default: false,
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