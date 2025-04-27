<template>
    <section
        class="section-center py-30"
        v-if="!playlists"
    >
        <Loader />
    </section>
    <section
        class="page-chart-playlists"
        v-else
    >
        <PlaylistGrid>
            <PlaylistItem
                v-for="playlist in playlists"
                :key="playlist.id"
                v-bind="playlist"
            />
        </PlaylistGrid>
    </section>
</template>

<script setup>
import Loader from '@/components/Loader.vue';
import PlaylistGrid from '@/components/Playlists/PlaylistGrid.vue';
import PlaylistItem from '@/components/Playlists/PlaylistItem.vue';
import { inject, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const api = inject('api');
const route = useRoute();
const chartId = route.params.chartId;
const playlists = ref(null);

onMounted(async () => {
    playlists.value = await api.getChartPlaylists(chartId);
});
</script>

<style scoped>
.page-chart-playlists {
    @apply p-10;
}
</style>
