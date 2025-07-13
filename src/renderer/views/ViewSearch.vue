<template>
    <LayoutBase>
        <template v-if="isLoading">
            <section class="section-center">
                <Loader />
            </section>
        </template>
        <template v-else>
            <template v-if="searchType === 'charts'">
                <section class="chart-results">
                    <div class="filters">
                        <button
                            class="button"
                            v-interactable
                            @click="popoverDifficultiesOpen = !popoverDifficultiesOpen"
                        >
                            <Remixicon icon="shapes" :filled="true" />
                            <span>{{ [
                                searchDifficultyEasy && 'E',
                                searchDifficultyNormal && 'N',
                                searchDifficultyHard && 'H',
                                searchDifficultyExpert && 'EX',
                                searchDifficultyXD && 'XD'
                                ].filter(Boolean).join(', ')
                            }}</span>

                            <div
                                class="popover popover-difficulties"
                                v-if="popoverDifficultiesOpen"
                                @click.stop
                            >
                                <div>
                                    <span>{{ $t('difficulty.easy') }}</span>
                                    <Switch v-model="searchDifficultyEasy" />
                                </div>
                                <div>
                                    <span>{{ $t('difficulty.normal') }}</span>
                                    <Switch v-model="searchDifficultyNormal" />
                                </div>
                                <div>
                                    <span>{{ $t('difficulty.hard') }}</span>
                                    <Switch v-model="searchDifficultyHard" />
                                </div>
                                <div>
                                    <span>{{ $t('difficulty.expert') }}</span>
                                    <Switch v-model="searchDifficultyExpert" />
                                </div>
                                <div>
                                    <span>{{ $t('difficulty.xd') }}</span>
                                    <Switch v-model="searchDifficultyXD" />
                                </div>
                            </div>
                        </button>
                        <button
                            class="button"
                            v-interactable
                            @click="popoverRangeOpen = !popoverRangeOpen"
                        >
                            <Remixicon icon="expand-width" :filled="true" />
                            <span>{{ searchDifficultyFrom }} — {{ searchDifficultyTo }}</span>

                            <div
                                class="popover popover-range"
                                v-if="popoverRangeOpen"
                                @click.stop
                            >
                                <div>
                                    <span>{{ $t('search.minimumDifficulty') }}</span>
                                    <input type="number" class="input" v-model="searchDifficultyFrom" />
                                </div>
                                <div>
                                    <span>{{ $t('search.maximumDifficulty') }}</span>
                                    <input type="number" class="input" v-model="searchDifficultyTo" />
                                </div>
                            </div>
                        </button>
                        <button
                            class="button"
                            v-interactable
                            @click="searchShowExplicit = !searchShowExplicit"
                        >
                            <span>{{ $t('search.explicit') }}</span>
                            <Switch v-model="searchShowExplicit" style="pointer-events: none" :mini="true" />
                        </button>
                        <button
                            class="button brand"
                            @click="loadResults"
                        >
                            <span>{{ $t('search.apply') }}</span>
                        </button>
                    </div>

                    <EmptyState
                        :label="$t('search.noChartResults')"
                        icon="music-2"
                        v-if="results.length === 0"
                    />
                    <ChartGrid v-else>
                        <ChartItem v-for="chart in results" :key="chart.id" v-bind="chart" />
                    </ChartGrid>
                </section>
            </template>
            <template v-if="searchType === 'playlists'">
                <div
                    v-if="results.length === 0"
                    class="p-10"
                >
                    <EmptyState
                        :label="$t('search.noPlaylistResults')"
                        icon="album"
                    />
                </div>
                <PlaylistGrid class="p-10" v-else>
                    <PlaylistItem v-for="playlist in results" :key="playlist.id" v-bind="playlist" />
                </PlaylistGrid>
            </template>
            <template v-if="searchType === 'users'">
                <div
                    v-if="results.length === 0"
                    class="p-10"
                >
                    <EmptyState
                        :label="$t('search.noUserResults')"
                        icon="user-3"
                    />
                </div>
                <section class="user-grid" v-else>
                    <UserItem v-for="user in results" :key="user.id" v-bind="user" />
                </section>
            </template>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import {useRoute} from "vue-router";
import {computed, inject, nextTick, onMounted, ref, watch} from "vue";
import Loader from "@/components/Loader.vue";
import UserItem from "@/components/Users/UserItem.vue";
import PlaylistGrid from "@/components/Playlists/PlaylistGrid.vue";
import PlaylistItem from "@/components/Playlists/PlaylistItem.vue";
import ChartGrid from "@/components/Charts/ChartGrid.vue";
import ChartItem from "@/components/Charts/ChartItem.vue";
import Remixicon from "@/components/Remixicon.vue";
import Switch from "@/components/Switch.vue";
import EmptyState from "@/components/EmptyState.vue";

const api = inject('api');
const route = useRoute();
const searchType = computed(() => route.query.type);
const searchQuery = computed(() => route.query.query);
const searchShowExplicit = ref(true);
const searchDifficultyEasy = ref(true);
const searchDifficultyNormal = ref(true);
const searchDifficultyHard = ref(true);
const searchDifficultyExpert = ref(true);
const searchDifficultyXD = ref(true);
const searchDifficultyFrom = ref(0);
const searchDifficultyTo = ref(99);
const popoverDifficultiesOpen = ref(false);
const popoverRangeOpen = ref(false);

const isLoading = ref(false);
const results = ref([]);

async function loadResults() {
    isLoading.value = true;
    popoverDifficultiesOpen.value = false;
    popoverRangeOpen.value = false;
    results.value = [];

    switch(searchType.value) {
        case 'charts':
            results.value = await api.searchCharts(searchQuery.value, {
                diffEasy: searchDifficultyEasy.value,
                diffNormal: searchDifficultyNormal.value,
                diffHard: searchDifficultyHard.value,
                diffExpert: searchDifficultyExpert.value,
                diffXD: searchDifficultyXD.value,
                diffRatingFrom: searchDifficultyFrom.value,
                diffRatingTo: searchDifficultyTo.value,
                showExplicit: searchShowExplicit.value,
            });
            break;
        case 'playlists':
            results.value = await api.searchPlaylists(searchQuery.value);
            break;
        case 'users':
            results.value = await api.searchUsers(searchQuery.value);
            break;
    }

    isLoading.value = false;
}

onMounted(() => {
    loadResults();
});
watch(() => [searchType.value, searchQuery.value], () => {
    loadResults();
});
</script>

<style scoped>
.chart-results {
    @apply p-10 flex flex-col gap-5;

    & .filters {
        @apply flex flex-wrap gap-2 items-center;

        & button:has(.popover) {
            @apply relative;
        }
        & .popover {
            @apply bg-base-900 border border-base-300 dark:border-base-800 p-5 rounded-md absolute top-12 left-0 z-10 w-[280px] flex flex-col gap-2.5;

            & > div {
                @apply flex gap-2.5 items-center;

                & > span {
                    @apply grow text-left;
                }
                & > input[type="number"] {
                    @apply w-20;
                }
            }
        }
    }
}

.user-grid {
    @apply flex flex-col gap-3 p-10;
}
@media screen and (min-width: 900px) {
    .user-grid {
        @apply grid grid-cols-2;
    }
}
@media screen and (min-width: 1300px) {
    .user-grid {
        @apply grid grid-cols-3;
    }
}
</style>
