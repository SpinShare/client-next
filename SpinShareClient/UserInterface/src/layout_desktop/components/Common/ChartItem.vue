<template>
    <div
        class="chart-item"
        :class="{ explicit: isExplicit }"
        @click.left="handleClick"
        @click.middle="handleAddToQueue"
        @mousedown.middle.prevent.stop
    >
        <div
            class="cover"
            :style="`background-image: url(${cover})`"
        >
            <template v-if="libraryState">
                <span
                    v-if="
                        queueState === null &&
                        libraryState.installed &&
                        !libraryState.updated
                    "
                    v-tooltip="t('chart.state.updateAvailable')"
                    class="tag tag-installed"
                >
                    <span class="mdi mdi-update"></span>
                </span>
                <span
                    v-if="
                        queueState === null &&
                        libraryState.installed &&
                        libraryState.updated
                    "
                    v-tooltip="t('chart.state.updated')"
                    class="tag tag-updated"
                >
                    <span class="mdi mdi-check"></span>
                </span>
                <span
                    v-if="queueState !== null && queueState !== STATE_DONE"
                    v-tooltip="t('chart.state.downloading')"
                    class="tag tag-downloading"
                >
                    <span class="mdi mdi-loading"></span>
                </span>
            </template>
        </div>
        <div class="meta">
            <div class="title">{{ title }}</div>
            <div class="artist">{{ artist }} &bull; {{ charter }}</div>
            <div class="difficulties">
                <span :class="{ active: hasEasyDifficulty }">
                    <span>E</span>
                    <span v-if="hasEasyDifficulty">{{ easyDifficulty }}</span>
                </span>
                <span :class="{ active: hasNormalDifficulty }">
                    <span>N</span>
                    <span v-if="hasNormalDifficulty">{{
                        normalDifficulty
                    }}</span>
                </span>
                <span :class="{ active: hasHardDifficulty }">
                    <span>H</span>
                    <span v-if="hasHardDifficulty">{{ hardDifficulty }}</span>
                </span>
                <span :class="{ active: hasExtremeDifficulty }">
                    <span>EX</span>
                    <span v-if="hasExtremeDifficulty">{{
                        expertDifficulty
                    }}</span>
                </span>
                <span :class="{ active: hasXDDifficulty }">
                    <span>XD</span>
                    <span v-if="hasXDDifficulty">{{ XDDifficulty }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import router from '@/layout_desktop/router';
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
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
    fileReference: {
        type: String,
        required: true,
    },
    updateHash: {
        type: String,
        required: true,
    },
    cover: {
        type: [String, Boolean],
        default: false,
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
});

/* eslint-disable no-unused-vars */
const STATE_QUEUED = 0;
const STATE_DOWNLOADING = 1;
const STATE_EXTRACTING = 2;
const STATE_COPYING = 3;
const STATE_CACHING = 4;
const STATE_DONE = 5;
/* eslint-enable no-unused-vars */

const libraryState = ref(null);
const queueState = ref(null);

onMounted(() => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'library-get-state',
            data: {
                fileReference: props.fileReference,
                updateHash: props.updateHash,
            },
        }),
    );
});

emitter.on('library-get-state-response', (state) => {
    if (state.spinshareReference === props.fileReference) {
        libraryState.value = state;
    }
});

emitter.on('queue-item-update-response', (queueItem) => {
    if (queueItem.FileReference === props.fileReference) {
        queueState.value = queueItem.State;

        if (queueItem.State === STATE_DONE) {
            libraryState.value.installed = true;
            libraryState.value.updated = true;
            queueState.value = null;
        }
    }
});

const handleClick = () => {
    router.push({
        path: '/chart/' + props.id,
    });
};

const handleAddToQueue = (event) => {
    event.preventDefault();

    if (queueState.value !== null) return;

    window.external.sendMessage(
        JSON.stringify({
            command: 'queue-add',
            data: {
                id: props.id,
                title: props.title,
                artist: props.artist,
                charter: props.charter,
                cover: props.cover,
                fileReference: props.fileReference,
            },
        }),
    );

    queueState.value = 0;
};
</script>

<style lang="scss" scoped>
.chart-item {
    position: relative;
    height: 85px;
    background: rgba(var(--colorBaseText), 0.07);
    border-radius: 6px;
    padding: 10px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: center;
    transition: 0.15s ease-in-out all;

    & .cover {
        width: 65px;
        height: 65px;
        border-radius: 4px;
        background-position: center;
        background-size: cover;
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            backdrop-filter: blur(0px);
            z-index: 2;
            transition: 0.2s ease-in-out all;
        }

        & .tag {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.6);
            color: rgb(255, 255, 255);
            height: 20px;
            width: 20px;
            border-radius: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3;

            &.tag-downloading {
                & .mdi {
                    animation: loadingLoop 0.4s linear infinite;
                }
            }
        }
    }
    & .meta {
        display: grid;
        gap: 5px;

        & .title,
        & .subtitle {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        & .artist {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: rgba(var(--colorBaseText), 0.4);
            font-size: 0.9rem;
        }
        & .difficulties {
            display: flex;
            gap: 5px;
            margin-top: 5px;

            & > span {
                padding: 3px 7px;
                background: rgba(var(--colorBaseText), 0.07);
                border-radius: 2px;
                font-size: 0.6rem;

                & span:nth-child(1) {
                    font-weight: bold;
                }
                & span:nth-child(2) {
                    margin-left: 5px;
                }

                &:not(.active) {
                    opacity: 0.4;
                }
            }
        }
    }

    &.explicit {
        & > * {
            transition: 0.2s ease-in-out all;
        }
        &:not(:hover) > * {
            opacity: 0.4;

            &.cover::before {
                backdrop-filter: blur(5px);
            }
            &.meta {
                filter: blur(5px);
            }
        }
        &::after {
            content: 'Explicit - Hover to reveal';
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            color: rgb(var(--colorBaseText), 0.6);
            transition: 0.2s ease-in-out opacity;
            pointer-events: none;
        }
        &:hover::after {
            opacity: 0;
        }
    }

    &:hover {
        background: rgba(var(--colorBaseText), 0.14);
        cursor: pointer;
    }
}
</style>
