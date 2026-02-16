<template>
    <aside :class="`${expanded ? 'expanded' : 'mini'}`">
        <nav>
            <SidebarItemLink
                to="/"
                :label="$t('sidebar.frontpage')"
                icon="dashboard"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/new/0"
                :label="$t('sidebar.newest')"
                icon="history"
                :active="route.fullPath.includes('new/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/updated/0"
                :label="$t('sidebar.updated')"
                icon="loop-left"
                :active="route.fullPath.includes('updated/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/hotThisWeek/0"
                :label="$t('sidebar.hotThisWeek')"
                icon="fire"
                :active="route.fullPath.includes('hotThisWeek/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/hotThisMonth/0"
                :label="$t('sidebar.hotThisMonth')"
                icon="fire"
                :active="route.fullPath.includes('hotThisMonth/')"
                :expanded="expanded"
            />
        </nav>

        <nav>
            <SidebarExpandedToggle :expanded="expanded" />
            <SidebarDownloadQueue :expanded="expanded" />
            <SidebarItemLink
                to="/library"
                :label="$t('sidebar.library')"
                icon="book-shelf"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/settings"
                :label="$t('sidebar.settings')"
                icon="settings-2"
                :expanded="expanded"
            />
        </nav>
    </aside>
</template>

<script setup>
import SidebarItemLink from '@/components/Sidebar/SidebarItemLink.vue';
import SidebarExpandedToggle from '@/components/Sidebar/SidebarExpandedToggle.vue';
import { useRoute } from 'vue-router';
import SidebarDownloadQueue from '@/components/Sidebar/SidebarDownloadQueue.vue';

defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

const route = useRoute();
</script>

<style scoped>
aside {
    @apply border-base-300 dark:border-base-800 border-r w-[70px] py-4 grid grid-rows-[1fr_auto] gap-2 transition-all ease-snappy relative z-100;
    grid-row: 2 / -1;

    & nav {
        @apply flex gap-2 flex-col;
    }

    &.expanded {
        @apply w-[275px] p-4;
    }
    &.mini {
        @apply justify-center;

        & nav {
            @apply items-center;
        }
    }
}
</style>
