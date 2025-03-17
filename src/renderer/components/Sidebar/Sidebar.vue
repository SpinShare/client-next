<template>
    <aside :class="`${expanded ? 'expanded' : 'mini'}`">
        <div class="brand">
            <SpinShareIcon class="icon" />
            <SpinShareLogo class="full" />
        </div>

        <nav>
            <SidebarItemLink
                to="/"
                label="Frontpage"
                icon="dashboard"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/search"
                label="Search"
                icon="search"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/discover/new/0"
                label="Discover"
                icon="compass-discover"
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
            <SidebarItemLink
                to="/settings"
                label="Settings"
                icon="settings-2"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/login"
                label="Login"
                icon="key"
                :expanded="expanded"
            />
        </nav>
    </aside>
</template>

<script setup>
import SpinShareIcon from '@/assets/images/logo_icon.svg?component';
import SpinShareLogo from '@/assets/images/logo_full.svg?component';
import SidebarItemLink from '@/components/Sidebar/SidebarItemLink.vue';
import SidebarExpandedToggle from '@/components/Sidebar/SidebarExpandedToggle.vue';

defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});
</script>

<style scoped>
@reference "@/assets/css/app.css";

aside {
    @apply border-base-800 border-r w-[70px] py-4 grid grid-rows-[auto_1fr_auto] gap-2 transition-all ease-snappy;

    & .brand {
        @apply flex items-center justify-center;

        & .icon {
            @apply h-[30px];
        }
        & .full {
            @apply h-[30px];
        }
    }

    & nav {
        @apply flex justify-center gap-2 flex-col;
    }

    &.expanded {
        @apply w-[275px] p-4;

        & .brand {
            & .icon {
                @apply hidden;
            }
            & .full {
                @apply block;
            }
        }
    }
    &.mini {
        @apply justify-center;

        & .brand {
            @apply justify-center;

            & .icon {
                @apply block;
            }
            & .full {
                @apply hidden;
            }
        }

        & nav {
            @apply items-center;
        }
    }
}
</style>
