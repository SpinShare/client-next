<template>
    <AppLayout>
        <section class="view-discover">
            <section>
                <SpinHeader
                    :label="t('frontpage.title')"
                />
                <PromoGrid
                    :promos="promos"
                />
            </section>
            <section>
                <SpinHeader
                    :label="t('frontpage.featured.title')"
                >
                    <SpinButton
                        icon="playlist-music"
                        :label="t('frontpage.featured.seeMore')"
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
import PromoGrid from "@/layout_desktop/components/Discover/PromoGrid.vue";
import {FEATURED_PLAYLIST_ID, getPromos} from "@/api/api";
import FeaturedGrid from "@/layout_desktop/components/Discover/FeaturedGrid.vue";
import AppLayout from "@/layout_desktop/layouts/AppLayout.vue";
import router from "@/router";

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

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
