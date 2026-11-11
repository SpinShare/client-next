<template>
    <div
        class="bp-home"
        @focusin="handleFocusIn"
    >
        <transition name="backdrop">
            <div
                v-if="backdrop"
                :key="backdrop"
                class="backdrop"
                :style="{ backgroundImage: backdrop }"
            ></div>
        </transition>

        <section
            class="promos"
            data-nav-group
        >
            <template v-if="promos.length === 0">
                <PromoItemPlaceholder
                    v-for="n in 2"
                    :key="n"
                />
            </template>
            <template v-else>
                <PromoItem
                    v-for="(promo, index) in promos"
                    :key="promo.id"
                    v-bind="promo"
                    :data-nav-autofocus="index === 0 ? '' : null"
                />
            </template>
        </section>

        <BigPictureShelf
            v-for="shelf in shelves"
            :key="shelf.key"
            :title="$t(shelf.title)"
            :to="shelf.to"
            :loading="shelf.loading"
        >
            <ChartItem
                v-for="chart in shelf.items"
                :key="chart.id"
                v-bind="chart"
            />
        </BigPictureShelf>
    </div>
</template>

<script setup>
import { inject, onMounted, reactive, ref } from 'vue';
import PromoItem from '@/components/Discover/PromoItem.vue';
import PromoItemPlaceholder from '@/components/Discover/PromoItemPlaceholder.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';
import BigPictureShelf from '@/components/BigPicture/BigPictureShelf.vue';

const api = inject('api');
const promos = ref([]);
const backdrop = ref(null);

const shelves = [
    {
        key: 'featured',
        title: 'discover.featured.header',
        to: '/playlist/144',
        load: async () => (await api.getPlaylist(144))?.songs?.slice(0, 12),
    },
    { key: 'new', title: 'sidebar.newest', to: '/discover/new/0', load: () => api.getNewCharts(0) },
    { key: 'hotThisWeek', title: 'sidebar.hotThisWeek', to: '/discover/hotThisWeek/0', load: () => api.getHotThisWeekCharts(0) },
    { key: 'updated', title: 'sidebar.updated', to: '/discover/updated/0', load: () => api.getUpdatedCharts(0) },
    { key: 'hotThisMonth', title: 'sidebar.hotThisMonth', to: '/discover/hotThisMonth/0', load: () => api.getHotThisMonthCharts(0) },
].map((shelf) => reactive({ ...shelf, items: [], loading: true }));

onMounted(() => {
    api.getPromos().then((result) => {
        promos.value = result ?? [];
    });

    for (const shelf of shelves) {
        shelf
            .load()
            .then((items) => {
                shelf.items = items ?? [];
            })
            .catch((error) => {
                console.error(`[BigPicture] Could not load shelf ${shelf.key}`, error);
            })
            .finally(() => {
                shelf.loading = false;
            });
    }
});

function handleFocusIn(event) {
    const cover = event.target.closest?.('.chart-item')?.querySelector('.cover')?.style.backgroundImage;
    if (cover) backdrop.value = cover;
}
</script>

<style scoped>
.bp-home {
    @apply flex flex-col gap-8 pt-4 pb-10 relative isolate;

    & .backdrop {
        @apply fixed inset-0 bg-cover bg-center -z-10 pointer-events-none;
        filter: blur(60px) saturate(1.4);
        opacity: 0.18;
        transform: scale(1.2);
    }

    & .promos {
        @apply grid grid-cols-2 gap-5 px-10;
    }
}

.backdrop-enter-active,
.backdrop-leave-active {
    transition: opacity 0.6s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
    opacity: 0 !important;
}
</style>
