<template>
    <AppLayout>
        <section class="view-discover">
            <section>
                <SpinHeader :label="t('frontpage.title')" />
                <PromoGrid :promos="promos" />
            </section>
            <section>
                <SpinHeader :label="t('frontpage.featured.title')">
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
import { ref, onMounted, nextTick, inject } from 'vue';
import PromoGrid from '@/components/Discover/PromoGrid.vue';
import { FEATURED_PLAYLIST_ID, getPromos } from '@/api/api';
import FeaturedGrid from '@/components/Discover/FeaturedGrid.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import router from '@/router';

const emitter = inject('emitter');
import { useI18n } from 'vue-i18n';
import { Buttons, focusableElements } from '@/modules/useGamepad';
const { t } = useI18n();

const promos = ref([]);

onMounted(async () => {
    promos.value = await getPromos();

    if (window.spinshare.settings.IsConsole) {
        // Select first Element
        await nextTick();
        const firstFocusableElement = document.body
            .querySelector('.view-discover')
            .querySelector(focusableElements);

        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }

        // Controller Hints
        let controllerHintItems = [];

        controllerHintItems.push({
            input: Buttons.A,
            label: t('general.select'),
            onclick: () => {
                const focussedElement = document.body.querySelector('*:focus');
                if (focussedElement) {
                    focussedElement.click();
                }
            },
        });

        emitter.emit('console-update-controller-hints', {
            showMenu: true,
            showBack: true,
            items: controllerHintItems,
        });
    }
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
