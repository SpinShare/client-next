<template>
    <AppLayout>
        <section class="view-discover">
            <section>
                <header>
                    <h1>Discover</h1>
                </header>
                <PromoGrid
                    :promos="promos"
                />
            </section>
            <section>
                <header>
                    <h1>Featured</h1>
                </header>
                <FeaturedGrid />
            </section>
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PromoGrid from "@/components/Discover/PromoGrid.vue";
import { getPromos } from "@/api/api";
import FeaturedGrid from "@/components/Discover/FeaturedGrid.vue";
import AppLayout from "@/layouts/AppLayout.vue";

const promos = ref([]);

onMounted(async () => {
    promos.value = await getPromos();
});
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
        
        & header {
            & h1 {
                font-size: 24px;
                font-weight: 700;
            }
        }
    }
}
</style>
