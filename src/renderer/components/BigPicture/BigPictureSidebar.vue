<template>
    <transition name="bp-fade">
        <div
            v-show="gamepadState.sidebarOpen"
            class="bp-card-backdrop"
            @click="close"
        ></div>
    </transition>
    <transition name="bp-slide-left">
        <aside
            v-show="gamepadState.sidebarOpen"
            class="bp-card bp-sidebar"
            data-nav-scope
            @nav-back.prevent="close"
        >
            <div class="brand">
                <SpinShareLogo />
            </div>

            <nav class="primary">
                <RouterLink
                    v-for="section in sections"
                    :key="section.to"
                    :to="section.to"
                    :class="['bp-menu-item', { active: isActive(section) }]"
                    :data-nav-autofocus="isActive(section) ? '' : null"
                    @click="close"
                    v-interactable
                >
                    <Remixicon
                        :icon="section.icon"
                        size="xl"
                        :filled="isActive(section)"
                    />
                    <span class="label">{{ $t(section.label) }}</span>
                </RouterLink>
            </nav>

            <nav class="secondary">
                <div class="downloads">
                    <SidebarDownloadQueue :expanded="true" />
                </div>
                <RouterLink
                    v-if="!account.isLoggedIn && !account.loading"
                    to="/connect/login"
                    :class="['bp-menu-item', { active: route.path === '/connect/login' }]"
                    @click="close"
                    v-interactable
                >
                    <Remixicon
                        icon="key"
                        size="xl"
                    />
                    <span class="label">{{ $t('header.auth.login') }}</span>
                </RouterLink>
                <RouterLink
                    :to="settings.to"
                    :class="['bp-menu-item', { active: isActive(settings) }]"
                    :data-nav-autofocus="isActive(settings) ? '' : null"
                    @click="close"
                    v-interactable
                >
                    <Remixicon
                        :icon="settings.icon"
                        size="xl"
                        :filled="isActive(settings)"
                    />
                    <span class="label">{{ $t(settings.label) }}</span>
                </RouterLink>
            </nav>
        </aside>
    </transition>
</template>

<script setup>
import { inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import SpinShareLogo from '@/assets/images/logo_full.svg';
import Remixicon from '@/components/Remixicon.vue';
import SidebarDownloadQueue from '@/components/Sidebar/SidebarDownloadQueue.vue';
import { BIG_PICTURE_SECTIONS, BIG_PICTURE_SETTINGS } from '@/components/BigPicture/sections';
import { gamepadState } from '@/modules/gamepad/state';
import { useAccount } from '@/modules/account';

const mitt = inject('mitt');
const route = useRoute();
const sections = BIG_PICTURE_SECTIONS;
const settings = BIG_PICTURE_SETTINGS;
const { account } = useAccount();

function isActive(section) {
    return section.match(route.path);
}

function close() {
    gamepadState.sidebarOpen = false;
}

watch(
    () => route.fullPath,
    () => close(),
);

watch(
    () => gamepadState.sidebarOpen,
    (open) => {
        if (!open) mitt.emit('queue-close');
    },
);
</script>

<style scoped>
.bp-sidebar {
    @apply left-4 w-[300px] gap-2 p-4 overflow-y-auto;
    scrollbar-width: none;

    & .brand {
        @apply flex items-center px-3 pt-2 pb-4;

        & svg {
            @apply h-[32px] w-auto;
        }
    }

    & nav {
        @apply flex flex-col gap-1;

        &.secondary {
            @apply mt-auto pt-3 border-t border-base-200 dark:border-base-800;
        }
    }

    & .downloads :deep(.tooltip),
    & .downloads :deep(.trigger) {
        @apply block w-full;
    }
    & .downloads :deep(.item-button) {
        @apply gap-3 h-[52px] px-4 rounded text-base-700 dark:text-base-200;

        &:hover {
            @apply bg-base-200 text-base-900 dark:bg-base-900 dark:text-base-50;
        }
        &.active {
            @apply bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50;
        }
        & .label {
            @apply font-semibold whitespace-nowrap;
        }
    }
}
</style>
