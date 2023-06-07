<template>
    <AppLayout>
        <section
            class="view-playlist-detail"
            v-if="playlist"
        >
            <header>
                <div
                    class="cover"
                    :style="`background-image: url('${playlist.cover}')`"
                >
                    <div class="shade">
                        <div class="content">
                            <h1>{{ playlist.title }}</h1>
                            <div class="meta">
                                <div
                                    class="charts-count"
                                >
                                    <span class="mdi mdi-playlist-music"></span>
                                    <span>{{ playlist.songs.length }} Charts</span>
                                </div>
                                <span
                                    class="tag-official"
                                    v-if="playlist.isOfficial"
                                    v-tooltip="'This is a playlist by the SpinShare team.'"
                                >
                                    <span class="mdi mdi-check"></span>
                                    <span>Official</span>
                                </span>
                            </div>
                        </div>
                        <div class="actions">
                            <SpinButton
                                icon="download"
                                color="primary"
                                label="Add to queue"
                                @click="handleAddToQueue"
                            />
                            <SpinButton
                                icon="open-in-new"
                                v-tooltip="'Open on SpinSha.re'"
                                @click="handleOpenInBrowser"
                            />
                        </div>
                    </div>
                </div>
                <div class="description">
                    {{ playlist.description }}
                </div>
            </header>
            
            <ChartList
                v-if="playlist.songs"
                :charts="playlist.songs"
            />
        </section>
        <section
            class="view-playlist-loading"
            v-else
        >
            <SpinLoader />
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import {getPlaylist} from "@/api/api";
const emitter = inject('emitter');

import AppLayout from "../../layouts/AppLayout.vue";
import ChartList from "@/components/Common/ChartList.vue";

const route = useRoute();
const playlist = ref(null);

onMounted(async () => {
    playlist.value = await getPlaylist(route.params.playlistId);
});

const handleAddToQueue = () => {
    if(playlist.value === null) return;
    
    playlist.value.songs.forEach(chart => {
        window.external.sendMessage(JSON.stringify({
            command: "queue-add",
            data: {
                id: chart.id,
                title: chart.title,
                artist: chart.artist,
                charter: chart.charter,
                cover: chart.cover,
                fileReference: chart.fileReference,
            },
        }));
    });
};

const handleOpenInBrowser = () => {
    window.external.sendMessage(JSON.stringify({
        command: "open-in-browser",
        data: "https://spinsha.re/playlist/" + playlist.value.id,
    }));
};
</script>

<style lang="scss" scoped>
.view-playlist-loading {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-playlist-detail {
    & header {
        border-bottom: 1px solid rgba(var(--colorBaseText),0.07);
        
        & .cover {
            height: 220px;
            background-position: center;
            background-size: cover;
            display: flex;
            align-items: flex-end;
            
            & .shade {
                padding: 40px;
                background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8));
                width: 100%;
                display: grid;
                grid-template-columns: 1fr auto;
                align-items: center;
                
                & .content {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    
                    & h1 {
                        font-size: 1.5em;
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
                            color: rgba(255, 255, 255 ,0.6);

                            & > span:nth-child(2) {
                                font-size: 0.75em;
                            }
                        }

                        & .tag-official {
                            padding: 5px 10px;
                            border-radius: 100px;
                            font-size: 0.75em;
                            background: rgba(var(--colorSuccess), 0.2);
                            color: rgba(var(--colorSuccess));
                        }
                    }
                }
                & .actions {
                    display: flex;
                    gap: 5px;
                    padding: 10px;
                    border-radius: 6px;
                    background: rgb(var(--colorBase));
                }
            }
        }
        
        & .description {
            padding: 40px;
            display: flex;
            gap: 40px;
            flex-direction: column;
            line-height: 1.5em;
            white-space: pre-line;
            color: rgba(var(--colorBaseText),0.6);
            -webkit-user-select: auto;
            -moz-user-select: auto;
            user-select: auto;
            cursor: text;
        }
    }
    & .chart-list {
        padding: 40px;
    }
}
</style>