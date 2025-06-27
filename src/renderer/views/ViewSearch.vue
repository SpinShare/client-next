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
                        <button class="button">
                            <Remixicon icon="shapes" :filled="true" />
                            <span>E, N, H, EX, XD</span>
                        </button>
                        <button class="button">
                            <Remixicon icon="expand-width" :filled="true" />
                            <span>0 — 99</span>
                        </button>
                        <button class="button">
                            <Remixicon icon="checkbox-circle" :filled="true" />
                            <span>Explicit</span>
                        </button>
                    </div>

                    <ChartGrid>
                        <ChartItem v-for="chart in results" :key="chart.id" v-bind="chart" />
                    </ChartGrid>
                </section>
            </template>
            <template v-if="searchType === 'playlists'">
                <PlaylistGrid class="p-10">
                    <PlaylistItem v-for="playlist in results" :key="playlist.id" v-bind="playlist" />
                </PlaylistGrid>
            </template>
            <template v-if="searchType === 'users'">
                <section class="user-grid">
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
import UserItem from "@/components/UserItem.vue";
import PlaylistGrid from "@/components/Playlists/PlaylistGrid.vue";
import PlaylistItem from "@/components/Playlists/PlaylistItem.vue";
import ChartGrid from "@/components/Charts/ChartGrid.vue";
import ChartItem from "@/components/Charts/ChartItem.vue";
import Remixicon from "@/components/Remixicon.vue";

const api = inject('api');
const route = useRoute();
const searchType = computed(() => route.params.type);
const searchQuery = computed(() => route.params.query);

const isLoading = ref(false);
const results = ref([]);

async function loadResults() {
    isLoading.value = true;
    results.value = [];

    switch(searchType.value) {
        case 'charts':
            results.value = await api.searchCharts(searchQuery.value, {});
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
