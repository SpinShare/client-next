<template>
    <ChartList
        v-if="featuredPlaylist"
        :charts="featuredPlaylist.songs.reverse().slice(0, 6)"
    />
    <SpinLoader
            v-if="!featuredPlaylist"
    />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPlaylist } from "@/api/api";
import ChartList from "@/components/Common/ChartList.vue";

const featuredPlaylist = ref(null);

onMounted(async () => {
    featuredPlaylist.value = await getPlaylist(144);
});
</script>

<style lang="scss" scoped>
</style>
