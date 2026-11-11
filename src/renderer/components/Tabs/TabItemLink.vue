<template>
    <RouterLink
        :class="`item-link ${active ? 'active' : ''}`"
        :to="to"
        v-interactable
    >
        <Remixicon
            v-if="icon && isBigPicture"
            :icon="icon"
            :filled="active || isExactActive"
        />
        <span class="label">{{ label }}</span>
    </RouterLink>
</template>

<script setup>
import { useLink } from 'vue-router';
import Remixicon from '@/components/Remixicon.vue';
import { isBigPicture } from '@/modules/gamepad/state';

const props = defineProps({
    to: {},
    label: {
        type: String,
        default: '',
    },
    active: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: null,
    },
});

const { isExactActive } = useLink(props);
</script>

<style scoped>
.item-link {
    @apply transition-all px-5 h-[45px] text-base-600 dark:text-base-300 flex items-center gap-2 border-b-2 border-b-transparent;

    &:hover {
        @apply cursor-pointer border-b-base-600 text-base-800 dark:border-b-base-400 dark:text-base-50;
    }
    &.router-link-exact-active,
    &.active {
        @apply text-brand-700 border-b-brand-700 dark:text-brand-500 dark:border-b-brand-500;
    }
}

:root.big-picture .item-link {
    @apply h-[44px] px-4 rounded border-b-0 whitespace-nowrap text-base-600 dark:text-base-300;

    &:hover {
        @apply bg-base-200 text-base-900 dark:bg-base-900 dark:text-base-50;
    }
    &.router-link-exact-active,
    &.active {
        @apply bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50;
    }
}
</style>
