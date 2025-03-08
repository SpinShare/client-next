<template>
    <aside :class="`${expanded ? 'expanded' : 'mini'}`">
        <div class="brand">
            <SpinShareIcon class="icon" />
            <SpinShareLogo class="full" />
        </div>

        <nav>
            <SidebarItemLink
                to="/"
                label="Discover"
                icon="dashboard"
                :expanded="expanded"
            />
            <SidebarItemLink
                to="/setup"
                label="Test"
                icon="settings-2"
                :expanded="expanded"
            />
        </nav>

        <nav>
            <SidebarItemLink
                to="/settings"
                label="Settings"
                icon="settings-2"
                :expanded="expanded"
            />
        </nav>
    </aside>
</template>

<script setup lang="ts">
import SpinShareIcon from '@images/logo_icon.svg?component';
import SpinShareLogo from '@images/logo_full.svg?component';
import SidebarItemLink from '@components/Sidebar/SidebarItemLink.vue';

defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});
</script>

<style scoped>
@reference "@css/app.css";

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
