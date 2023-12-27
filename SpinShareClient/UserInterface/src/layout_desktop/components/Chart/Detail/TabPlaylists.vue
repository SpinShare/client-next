<template>
    <section class="chart-detail-tab-playlists">
        <PlaylistList
            v-if="playlists"
            :playlists="playlists"
        />
        <SpinLoader v-else />
    </section>
</template>

<script setup>
import {onMounted, ref} from "vue";
import PlaylistList from "@/layout_desktop/components/Common/PlaylistList.vue";
import {getChartPlaylists} from "@/api/api";

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const playlists = ref(null);

onMounted(async () => {
    playlists.value = await getChartPlaylists(props.id);
});
</script>

<style lang="scss" scoped>
.chart-detail-tab-playlists {
    padding: 40px;
}
</style>