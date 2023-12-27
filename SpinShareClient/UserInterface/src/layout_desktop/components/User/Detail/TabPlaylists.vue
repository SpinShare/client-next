<template>
    <section class="user-detail-tab-playlists">
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
import {getUserPlaylists} from "@/api/api";

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const playlists = ref(null);

onMounted(async () => {
    playlists.value = await getUserPlaylists(props.id);
});
</script>

<style lang="scss" scoped>
.user-detail-tab-playlists {
    padding: 40px;
}
</style>