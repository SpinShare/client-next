<template>
    <LayoutBase>
        <header>
            {{ chart }}
        </header>
        <nav>
            <TabList>
                <TabItemLink
                    :to="`/chart/${chartId}`"
                    label="Detail"
                />
                <TabItemLink
                    :to="`/chart/${chartId}/reviews`"
                    label="Reviews"
                />
                <TabItemLink
                    :to="`/chart/${chartId}/playlists`"
                    label="Playlists"
                />
                <TabItemLink
                    :to="`/chart/${chartId}/spinplays`"
                    label="SpinPlays"
                />
            </TabList>
        </nav>
        <main>
            <router-view />
        </main>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import {useRoute} from "vue-router";
import {inject, onMounted, ref} from "vue";
import TabList from "@/components/Tabs/TabList.vue";
import TabItemLink from "@/components/Tabs/TabItemLink.vue";

const api = inject('api');
const route = useRoute();
const chartId = route.params.chartId;
const chart = ref(null);

onMounted(async () => {
    chart.value = await api.getChart(chartId);
});
</script>

<style scoped>
@reference "@/assets/css/app.css";

header {
    @apply p-10;
}
</style>
