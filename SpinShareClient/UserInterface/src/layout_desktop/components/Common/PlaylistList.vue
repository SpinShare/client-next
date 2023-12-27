<template>
    <section class="playlist-list">
        <PlaylistItem
            v-for="playlist in playlists"
            :key="playlist.id"
            v-bind="playlist"
        />
    </section>
</template>

<script setup>
import PlaylistItem from "@/layout_desktop/components/Common/PlaylistItem.vue";
import UserItem from "@/layout_desktop/components/Common/UserItem.vue";

defineProps({
    playlists: {
        type: Array,
        default: () => [],
    }
});
</script>

<style lang="scss" scoped>
.playlist-list {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr;
}

@media screen and (min-width: 1400px) {
    .playlist-list {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

@media screen and (max-width: 1000px) {
    .playlist-list {
        grid-template-columns: 1fr;
    }
}
</style>