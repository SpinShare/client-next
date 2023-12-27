<template>
    <ChartList
        v-if="featuredPlaylist"
        :charts="featuredPlaylist"
    />
    <SpinLoader v-if="!featuredPlaylist" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FEATURED_PLAYLIST_ID, getPlaylist } from '@/api/api';
import ChartList from '@/layout_desktop/components/Common/ChartList.vue';

const featuredPlaylist = ref(null);

onMounted(async () => {
    let playlist = await getPlaylist(FEATURED_PLAYLIST_ID);
    featuredPlaylist.value = playlist?.songs?.slice(0, 6) ?? null;
});
</script>

<style lang="scss" scoped></style>
