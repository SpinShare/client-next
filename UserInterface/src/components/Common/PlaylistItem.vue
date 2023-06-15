<template>
    <div
        class="playlist-item"
        @click.left="handleClick"
    >
        <div
            class="cover"
            :style="`background-image: url('${cover}')`"
        >
            <div class="shade">
                <div class="content">
                    <h1>{{ title }}</h1>
                    <div class="meta">
                        <div
                            class="charts-count"
                        >
                            <span class="mdi mdi-playlist-music"></span>
                            <span>{{ songs }} Charts</span>
                        </div>
                        <span
                            class="tag-official"
                            v-if="isOfficial"
                            v-tooltip="'This is a playlist by the SpinShare team.'"
                        >
                            <span class="mdi mdi-check"></span>
                            <span>Official</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import router from "@/router";

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    songs: {
        type: Number,
        required: true,
    },
    isOfficial: {
        type: Boolean,
        default: false,
    },
});

const handleClick = () => {
    router.push({
        path: '/playlist/' + props.id,
    });
};
</script>

<style lang="scss" scoped>
.playlist-item {
    background-color: rgba(var(--colorBaseText),0.07);
    border-radius: 6px;
    transition: 0.15s ease-in-out all;
    overflow: hidden;
    
    & .cover {
        height: 150px;
        background-position: center;
        background-size: cover;
        display: flex;
        align-items: flex-end;

        & .shade {
            padding: 15px;
            background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8));
            width: 100%;

            & .content {
                display: flex;
                flex-direction: column;
                gap: 5px;

                & h1 {
                    font-size: 1.25rem;
                    color: rgb(255, 255, 255);
                }

                & .meta {
                    display: flex;
                    gap: 10px;
                    align-items: center;

                    & .charts-count {
                        display: flex;
                        gap: 5px;
                        align-items: center;
                        color: rgba(255, 255, 255, 0.6);

                        & > span:nth-child(2) {
                            font-size: 0.75rem;
                        }
                    }

                    & .tag-official {
                        padding: 5px 10px;
                        border-radius: 100px;
                        font-size: 0.75rem;
                        background: rgba(var(--colorSuccess), 0.2);
                        color: rgba(var(--colorSuccess));
                    }
                }
            }
        }
    }

    &:hover {
        background: rgba(var(--colorBaseText),0.14);
        cursor: pointer;
        opacity: 0.4;
    }
}
</style>