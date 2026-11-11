<template>
    <header class="bp-topbar">
        <div class="start">
            <button
                class="button ghost menu-button"
                :aria-label="$t('bigPicture.hints.menu')"
                @click="navigation.toggleSidebar(true)"
                v-interactable
            >
                <Remixicon icon="menu" />
            </button>
            <RouterLink
                to="/"
                class="brand"
                tabindex="-1"
                data-nav-skip
            >
                <SpinShareLogo />
            </RouterLink>
        </div>

        <button
            class="search-pill"
            @click="mitt.emit('bp-search-open')"
            v-interactable
        >
            <Remixicon icon="search" />
            <span class="placeholder">{{ $t('header.search.placeholder') }}</span>
            <ButtonGlyph button="Y" />
        </button>

        <div class="actions">
            <RoomSyncArea />
            <BigPictureAccount />
        </div>
    </header>
</template>

<script setup>
import { inject } from 'vue';
import SpinShareLogo from '@/assets/images/logo_full.svg';
import Remixicon from '@/components/Remixicon.vue';
import ButtonGlyph from '@/components/BigPicture/ButtonGlyph.vue';
import BigPictureAccount from '@/components/BigPicture/BigPictureAccount.vue';
import RoomSyncArea from '@/components/Header/RoomSyncArea.vue';

const mitt = inject('mitt');
const navigation = inject('navigation');
</script>

<style scoped>
.bp-topbar {
    @apply grid grid-cols-[1fr_minmax(0,560px)_1fr] items-center gap-6 h-[72px] px-6 relative z-60;
    @apply bg-gradient-to-b from-base-100 to-transparent dark:from-base-950 dark:to-transparent;

    & .start {
        @apply flex items-center gap-3;

        & .brand svg {
            @apply h-[28px] w-auto;
        }
    }

    & .search-pill {
        @apply flex items-center gap-3 h-[48px] px-4 rounded w-full cursor-pointer transition-colors;
        @apply bg-base-200/80 text-base-500 dark:bg-base-900/80 dark:text-base-400 border border-base-300 dark:border-base-800;

        &:hover {
            @apply bg-base-300 text-base-700 dark:bg-base-800 dark:text-base-200;
        }
        & .placeholder {
            @apply grow text-left truncate;
        }
    }

    & .actions {
        @apply flex items-center justify-end gap-2;
    }
}
</style>
