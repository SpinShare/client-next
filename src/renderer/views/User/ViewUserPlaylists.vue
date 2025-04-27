<template>
    <section
        class="section-center py-30"
        v-if="!playlists"
    >
        <Loader />
    </section>
    <section
        class="page-user-playlists"
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
const userId = route.params.userId;
const playlists = ref(null);

onMounted(async () => {
    playlists.value = await api.getUserPlaylists(userId);
});
</script>

<style scoped>
.page-user-playlists {
    @apply p-10;
}
</style>
