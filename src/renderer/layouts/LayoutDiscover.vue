<template>
    <LayoutBase>
        <nav>
            <TabList>
                <TabItemLink
                    to="/discover/new/0"
                    label="Newest"
                    :active="route.fullPath.includes('new/')"
                />
                <TabItemLink
                    to="/discover/updated/0"
                    label="Updated"
                    :active="route.fullPath.includes('updated/')"
                />
                <TabItemLink
                    to="/discover/hotThisWeek/0"
                    label="Hot this week"
                    :active="route.fullPath.includes('hotThisWeek/')"
                />
                <TabItemLink
                    to="/discover/hotThisMonth/0"
                    label="Hot this month"
                    :active="route.fullPath.includes('hotThisMonth/')"
                />
            </TabList>
        </nav>
        <main>
            <router-view :key="route.params.page" />
        </main>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import TabList from '@/components/Tabs/TabList.vue';
import TabItemLink from '@/components/Tabs/TabItemLink.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped>
@reference "@/assets/css/app.css";

header {
    @apply p-10 grid grid-cols-[auto_1fr] gap-4 items-center;
}
</style>
