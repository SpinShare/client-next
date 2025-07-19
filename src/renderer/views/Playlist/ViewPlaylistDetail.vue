<template>
    <LayoutBase>
        <template v-if="!playlist">
            <section class="section-center">
                <Loader />
            </section>
        </template>
        <template v-else>
            <header :style="`background-image: url(${playlist.cover});`"></header>
            <main>
                <div class="meta">
                    <div class="item">
                        <h1>{{ playlist.title }}</h1>
                        <div
                            class="badge-official"
                            v-if="playlist.isOfficial"
                        >
                            <Remixicon
                                icon="check"
                                filled
                                size="sm"
                            />
                            <span>{{ $t('playlist.official') }}</span>
                        </div>
                        <p>{{ playlist.description }}</p>
                    </div>

                    <div class="actions">
                        <button
                            class="button brand"
                            @click="handleAddToQueue"
                            v-interactable
                        >
                            <Remixicon icon="download" />
                            <span>{{ $t('playlist.addToQueue') }}</span>
                        </button>
                        <button
                            class="button"
                            @click="handleOpenUrl"
                            v-interactable
                        >
                            <Remixicon
                                icon="external-link"
                                filled
                            />
                        </button>
                        <button
                            class="button"
                            @click="handleCopyLink"
                            v-interactable
                        >
                            <Remixicon
                                icon="clipboard"
                            />
                        </button>
                    </div>

                    <UserItem v-bind="playlist.user" />

                    <div class="item">
                        <h1>{{ $t('playlist.withChartsBy') }}</h1>
                        <div class="charters">
                            <UserTooltip
                                v-for="charter in allCharters"
                                :key="charter[0]"
                                :userId="charter[0]"
                                :label="charter[1]"
                            />
                        </div>
                    </div>
                </div>
                <ChartGrid :single-column="true">
                    <ChartItem
                        v-for="chart in playlist.songs"
                        :key="chart.id"
                        v-bind="chart"
                    />
                </ChartGrid>
            </main>
        </template>
    </LayoutBase>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import LayoutBase from '@/layouts/LayoutBase.vue';
import Loader from '@/components/Loader.vue';
import ChartGrid from '@/components/Charts/ChartGrid.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';
import UserTooltip from '@/components/Users/UserTooltip.vue';
import Remixicon from '@/components/Remixicon.vue';
import UserItem from '@/components/Users/UserItem.vue';
import { DownloadItem } from '../../../main/queue/downloadQueueItem';

const api = inject('api');
const externalApi = inject('externalApi');
const queue = inject('queue');
const route = useRoute();
const playlistId = route.params.playlistId;
const playlist = ref(null);

onMounted(async () => {
    playlist.value = await api.getPlaylist(playlistId);
});

const allCharters = computed(() => {
    let charters = [];

    playlist.value.songs.forEach((chart) => {
        if (!charters.some(([uploader, charter]) => uploader === chart.uploader && charter === chart.charter)) {
            charters.push([chart.uploader, chart.charter]);
        }
    });

    return charters;
});

function handleAddToQueue() {
    playlist.value.songs.forEach((chart) => {
        const newDownloadItem = new DownloadItem(chart.id, chart.cover, chart.title, chart.artist, chart.charter, chart.fileReference);
        queue.addQueueItem(newDownloadItem);
    });
}

function handleOpenUrl() {
    externalApi.openUrl(`https://spinsha.re/playlist/${playlist.value.id}`);
}

function handleCopyLink() {
    externalApi.copyText(`https://spinsha.re/playlist/${playlist.value.id}`);
}
</script>

<style scoped>
header {
    @apply bg-cover bg-center bg-no-repeat p-10 pt-[200px];
}
main {
    @apply p-10 flex flex-col gap-10;

    & .meta {
        @apply flex flex-col gap-5;

        & .item {
            @apply flex flex-col gap-1 border border-base-300 dark:border-base-800 rounded-md p-5;

            & h1 {
                @apply grow text-2xl font-bold;
            }
            & .badge-official {
                @apply text-sm px-2 py-0.25 rounded-full bg-emerald-700 text-emerald-50 self-start flex gap-1 items-center;
            }
            & p {
                @apply text-base-500 dark:text-base-300 mt-4;
            }
            & .charters {
                @apply flex flex-wrap gap-2 mt-2;
            }
        }

        & .actions {
            @apply flex gap-2.5;

            & button:nth-child(1) {
                @apply grow justify-center;
            }
        }
    }
}

@media screen and (min-width: 1100px) {
    main {
        @apply grid grid-cols-[350px_1fr];
    }
}
</style>
