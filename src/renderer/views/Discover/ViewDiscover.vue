<template>
    <LayoutBase>
        <section class="page-discover">
            <div>
                <SectionHeader
                    title="Discover"
                />
                <PromoGrid>
                    <PromoItem
                        v-for="promo in promos"
                        :key="promo.id"
                        v-bind="promo"
                    />
                </PromoGrid>
            </div>

            <div>
                <SectionHeader
                    title="Featured"
                >
                    <RouterLink
                        class="button"
                        to="/playlist/144"
                    >
                        <Remixicon
                            icon="disc"
                        />
                        <span>See more</span>
                    </RouterLink>
                </SectionHeader>
                <ChartGrid>
                    <ChartItem
                        v-for="chart in staffpicks"
                        :key="chart.id"
                        v-bind="chart"
                    />
                </ChartGrid>
            </div>
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
import SectionHeader from "@/components/SectionHeader.vue";
import Remixicon from "@/components/Remixicon.vue";

const promos = ref([]);
const staffpicks = ref([]);
const api = inject('api');

onMounted(async () => {
    promos.value = await api.getPromos();
    staffpicks.value = (await api.getPlaylist(144))?.songs?.slice(0, 10) ?? [];
});
</script>

<style scoped>
@reference "@/assets/css/app.css";

.page-discover {
    @apply p-10 flex flex-col gap-10;

    & > div {
        @apply flex flex-col gap-2.5;
    }
}
</style>
