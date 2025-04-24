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
                            class="official"
                            v-if="playlist.isOfficial"
                        >
                            Official
                        </div>
                        <p>{{ playlist.description }}</p>
                    </div>

                    <div class="item">
                        <div class="label">With charts by</div>
                        <div class="charters">
                            <UserTooltip
                                v-for="charter in allCharters"
                                :key="charter[0]"
                                :userId="charter[0]"
                                :label="`@${charter[1]}`"
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
        if (!charters.some(([uploader]) => uploader === chart.uploader)) {
            charters.push([chart.uploader, chart.charter]);
        }
    });

    return charters;
});
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
            @apply flex flex-col gap-1 bg-base-900 rounded p-5 self-start;

            & h1 {
                @apply grow text-2xl font-bold;
            }
            & p {
                @apply text-base-400;
            }
            & .charters {
                @apply flex flex-wrap gap-1;
            }
        }
    }
}
</style>
