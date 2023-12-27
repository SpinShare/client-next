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
                                <div class="charts-count">
                                    <span class="mdi mdi-playlist-music"></span>
                                    <span>{{
                                        t('playlist.count', [
                                            playlist.songs.length,
                                        ])
                                    }}</span>
                                </div>
                                <span
                                    class="tag-official"
                                    v-if="playlist.isOfficial"
                                    v-tooltip="t('playlist.official.tooltip')"
                                >
                                    <span class="mdi mdi-check"></span>
                                    <span>{{
                                        t('playlist.official.tag')
                                    }}</span>
                                </span>
                            </div>
                        </div>
                        <div class="actions">
                            <SpinButton
                                icon="download"
                                color="primary"
                                :label="t('general.addToQueue')"
                                @click="handleAddToQueue"
                            />
                            <SpinButton
                                icon="open-in-new"
                                v-tooltip="t('general.openOnSpinShare')"
                                @click="handleOpenInBrowser"
                            />
                        </div>
                    </div>
                </div>
                <div class="meta">
                    <div
                        class="description"
                        v-if="playlist.description"
                    >
                        {{ playlist.description }}
                    </div>
                    <div
                        v-if="playlist.user && !playlist.isOfficial"
                        class="user"
                    >
                        <UserItem v-bind="playlist.user" />
                    </div>
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPlaylist } from '@/api/api';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import AppLayout from '../../layouts/AppLayout.vue';
import ChartList from '@/layout_desktop/components/Common/ChartList.vue';
import UserItem from '@/layout_desktop/components/Common/UserItem.vue';

const route = useRoute();
const playlist = ref(null);

onMounted(async () => {
    playlist.value = await getPlaylist(route.params.playlistId);
});

const handleAddToQueue = () => {
    if (playlist.value === null) return;

    playlist.value.songs.forEach((chart) => {
        window.external.sendMessage(
            JSON.stringify({
                command: 'queue-add',
                data: {
                    id: chart.id,
                    title: chart.title,
                    artist: chart.artist,
                    charter: chart.charter,
                    cover: chart.cover,
                    fileReference: chart.fileReference,
                },
            }),
        );
    });
};

const handleOpenInBrowser = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'open-in-browser',
            data: 'https://spinsha.re/playlist/' + playlist.value.id,
        }),
    );
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
        border-bottom: 1px solid rgba(var(--colorBaseText), 0.07);

        & .cover {
            height: 220px;
            background-position: center;
            background-size: cover;
            display: flex;
            align-items: flex-end;

            & .shade {
                padding: 40px;
                background: linear-gradient(
                    to bottom,
                    transparent,
                    rgba(0, 0, 0, 0.8)
                );
                width: 100%;
                display: grid;
                grid-template-columns: 1fr auto;
                align-items: center;

                & .content {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    & h1 {
                        font-size: 1.5rem;
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
                            display: flex;
                            gap: 5px;
                            align-items: center;
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
        & > .meta {
            padding: 40px;
            display: flex;
            flex-direction: column;
            gap: 20px;

            & .description {
                display: flex;
                gap: 40px;
                flex-direction: column;
                line-height: 1.5rem;
                white-space: pre-line;
                color: rgba(var(--colorBaseText), 0.6);
                -webkit-user-select: text;
                -moz-user-select: text;
                user-select: text;
                cursor: text;
            }
            & .user {
                margin: 0 auto;
                width: 100%;
                max-width: 500px;
            }
        }
    }
    & .chart-list {
        padding: 40px;
    }
}
</style>
