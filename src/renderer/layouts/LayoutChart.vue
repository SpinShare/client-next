<template>
    <LayoutBase>
        <header>
            Chart Header
        </header>
        <nav>
            <TabList>
                <TabItemLink
                    :to="`/chart/${chartId}`"
                    icon="settings-2"
                    label="Detail"
                />
                <TabItemLink
                    :to="`/chart/${chartId}/reviews`"
                    icon="settings-2"
                    label="Reviews"
                />
                <TabItemLink
                    :to="`/chart/${chartId}/playlists`"
                    icon="settings-2"
                    label="Playlists"
                />
                <TabItemLink
                    :to="`/chart/${chartId}/spinplays`"
                    icon="settings-2"
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
import {onMounted, ref} from "vue";
import TabList from "@/components/Tabs/TabList.vue";
import TabItemLink from "@/components/Tabs/TabItemLink.vue";

const route = useRoute();
const chartId = route.params.chartId;

onMounted(() => {
});
</script>

<style scoped>
@reference "@/assets/css/app.css";

header {
    @apply p-10;
}
</style>
