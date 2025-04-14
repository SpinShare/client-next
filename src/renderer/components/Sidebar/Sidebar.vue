<template>
    <aside :class="`${expanded ? 'expanded' : 'mini'}`">
        <nav>
            <SidebarItemLink
                to="/"
                label="Frontpage"
                icon="dashboard"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/new/0"
                label="Newest"
                icon="history"
                :active="route.fullPath.includes('new/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/updated/0"
                label="Updated"
                icon="loop-left"
                :active="route.fullPath.includes('updated/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/hotThisWeek/0"
                label="Hot this week"
                icon="fire"
                :active="route.fullPath.includes('hotThisWeek/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/hotThisMonth/0"
                label="Hot this month"
                icon="fire"
                :active="route.fullPath.includes('hotThisMonth/')"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/library"
                label="Library"
                icon="book-shelf"
                :expanded="expanded"
            />
        </nav>

        <nav>
            <SidebarExpandedToggle :expanded="expanded" />
            <SidebarItemButton
                label="Downloads"
                icon="download"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/settings"
                label="Settings"
                icon="settings-2"
                :expanded="expanded"
            />
        </nav>
    </aside>
</template>

<script setup>
import SidebarItemLink from '@/components/Sidebar/SidebarItemLink.vue';
import SidebarExpandedToggle from '@/components/Sidebar/SidebarExpandedToggle.vue';
import SidebarItemButton from '@/components/Sidebar/SidebarItemButton.vue';
import { useRoute } from 'vue-router';

defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

const route = useRoute();
</script>

<style scoped>
@reference "@/assets/css/app.css";

aside {
    @apply border-base-800 border-r w-[70px] py-4 grid grid-rows-[1fr_auto] gap-2 transition-all ease-snappy;

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
