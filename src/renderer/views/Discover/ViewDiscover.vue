<template>
    <LayoutBase>
        <section class="page-discover">
            <div>
                <SectionHeader title="Discover" />
                <PromoGrid>
                    <template v-if="promos.length === 0">
                        <PromoItemPlaceholder />
                        <PromoItemPlaceholder />
                    </template>
                    <template v-else>
                        <PromoItem
                            v-for="promo in promos"
                            :key="promo.id"
                            v-bind="promo"
                        />
                    </template>
                </PromoGrid>
            </div>

            <div>
                <SectionHeader title="Featured">
                    <RouterLink
                        v-interactable
                        class="button"
                        to="/playlist/144"
                    >
                        <Remixicon icon="disc" />
                        <span>See more</span>
                    </RouterLink>
                </SectionHeader>
                <ChartGrid>
                    <template v-if="staffpicks.length === 0">
                        <ChartItemPlaceholder
                            v-for="n in 10"
                            :key="n"
                        />
                    </template>
                    <template v-else>
                        <ChartItem
                            v-for="chart in staffpicks"
                            :key="chart.id"
                            v-bind="chart"
                        />
                    </template>
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
import ChartGrid from '@/components/Charts/ChartGrid.vue';
import ChartItem from '@/components/Charts/ChartItem.vue';
import SectionHeader from '@/components/SectionHeader.vue';
import Remixicon from '@/components/Remixicon.vue';
import ChartItemPlaceholder from '@/components/Charts/ChartItemPlaceholder.vue';
import PromoItemPlaceholder from '@/components/Discover/PromoItemPlaceholder.vue';

const promos = ref([]);
const staffpicks = ref([]);
const api = inject('api');

onMounted(async () => {
    promos.value = await api.getPromos();
    staffpicks.value = (await api.getPlaylist(144))?.songs?.slice(0, 10) ?? [];
});
</script>

<style scoped>
.page-discover {
    @apply p-10 flex flex-col gap-10;

    & > div {
        @apply flex flex-col gap-2.5;
    }
}
</style>
