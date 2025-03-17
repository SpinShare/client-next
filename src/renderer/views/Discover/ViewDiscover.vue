<template>
    <LayoutBase>
        <PromoGrid>
            <PromoItem
                v-for="promo in promos"
                :key="promo.id"
                v-bind="promo"
            />
        </PromoGrid>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { inject, onMounted, ref } from 'vue';
import PromoGrid from '@/components/Discover/PromoGrid.vue';
import PromoItem from '@/components/Discover/PromoItem.vue';

const promos = ref([]);
const api = inject('api');

onMounted(async () => {
    promos.value = await api.getPromos();
});
</script>

<style>
@reference "@/assets/css/app.css";
</style>
