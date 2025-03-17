<template>
    <LayoutBase>
        <section class="page-discover">
            <PromoGrid>
                <PromoItem
                    v-for="promo in promos"
                    :key="promo.id"
                    v-bind="promo"
                />
            </PromoGrid>
            <ChartGrid>
                <ChartItem
                    v-for="chart in staffpicks"
                    :key="chart.id"
                    v-bind="chart"
                />
            </ChartGrid>
        </section>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { inject, onMounted, ref } from 'vue';
import PromoGrid from '@/components/Discover/PromoGrid.vue';
import PromoItem from '@/components/Discover/PromoItem.vue';
import ChartGrid from '@/components/ChartGrid.vue';
import ChartItem from '@/components/ChartItem.vue';

const promos = ref([]);
const staffpicks = ref([]);
const api = inject('api');

onMounted(async () => {
    promos.value = await api.getPromos();
    staffpicks.value = (await api.getPlaylist(144))?.songs?.slice(0, 10) ?? [];
});
</script>

<style>
@reference "@/assets/css/app.css";

.page-discover {
    @apply py-10 flex flex-col gap-5;
}
</style>
