<template>
    <AppLayout>
        <section class="view-discover">
            <section>
                <SpinHeader
                    label="Discover"
                />
                <PromoGrid
                    :promos="promos"
                />
            </section>
            <section>
                <SpinHeader
                    label="Featured"
                >
                    <SpinButton
                        icon="playlist-music"
                        label="See more"
                        @click="handleOpenFeaturedPlaylist"
                    />
                </SpinHeader>
                <FeaturedGrid />
            </section>
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PromoGrid from "@/components/Discover/PromoGrid.vue";
import {FEATURED_PLAYLIST_ID, getPromos} from "@/api/api";
import FeaturedGrid from "@/components/Discover/FeaturedGrid.vue";
import AppLayout from "@/layouts/AppLayout.vue";
import router from "@/router";

const promos = ref([]);

onMounted(async () => {
    promos.value = await getPromos();
});

const handleOpenFeaturedPlaylist = () => {
    router.push({
        path: '/playlist/' + FEATURED_PLAYLIST_ID,
    });
};
</script>

<style lang="scss" scoped>
.view-discover {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    
    & > section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
}
</style>
