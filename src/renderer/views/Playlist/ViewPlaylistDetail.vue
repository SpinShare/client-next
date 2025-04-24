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
                            <span>Official</span>
                        </div>
                        <p>{{ playlist.description }}</p>
                    </div>

                    <div class="actions">
                        <button class="button brand">
                            <Remixicon icon="download" />
                            <span>Add to queue</span>
                        </button>
                        <button
                            class="button"
                            @click="handleOpenUrl"
                        >
                            <Remixicon
                                icon="external-link"
                                filled
                            />
                        </button>
                    </div>

                    <UserItem v-bind="playlist.user" />

                    <div class="item">
                        <h1>With charts by</h1>
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
import ChartGrid from '@/components/ChartGrid.vue';
import ChartItem from '@/components/ChartItem.vue';
import UserTooltip from '@/components/UserTooltip.vue';
import Remixicon from '@/components/Remixicon.vue';
import UserItem from '@/components/UserItem.vue';

const api = inject('api');
const externalApi = inject('externalApi');
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

function handleOpenUrl() {
    externalApi.openUrl(`https://spinsha.re/playlist/${playlist.value.id}`);
}
</script>

<style scoped>
header {
    @apply bg-cover bg-center bg-no-repeat p-10 pt-[200px];
}
main {
    @apply p-10 grid grid-cols-[350px_1fr] gap-10;

    & .meta {
        @apply flex flex-col gap-5;

        & .item {
            @apply flex flex-col gap-1 border border-base-800 rounded-md p-5;

            & h1 {
                @apply grow text-2xl font-bold;
            }
            & .badge-official {
                @apply text-sm px-2 py-0.25 rounded-full bg-emerald-700 text-emerald-50 self-start flex gap-1 items-center;

                & span {
                    @apply font-bold;
                }
            }
            & p {
                @apply text-base-400 mt-4;
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
</style>
