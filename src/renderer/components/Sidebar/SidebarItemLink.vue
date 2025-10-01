<template>
    <RouterLink
        :class="`item-link ${expanded ? 'expanded' : 'mini'} ${active ? 'active' : ''}`"
        :to="to"
        v-interactable
    >
        <Remixicon
            :icon="icon"
            size="xl"
            :filled="active || isExactActive"
        />
        <span class="label">{{ label }}</span>
    </RouterLink>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import { useLink } from 'vue-router';

const props = defineProps({
    to: {},
    label: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    active: {
        type: Boolean,
        default: false,
    },
    expanded: {
        type: Boolean,
        default: true,
    },
});

const { isExactActive } = useLink(props);
</script>

<style scoped>
.item-link {
    @apply h-[45px] transition-all rounded flex items-center;

    &:hover {
        @apply bg-base-200 text-base-900 dark:bg-base-900 dark:text-base-50 cursor-pointer;
    }
    &.router-link-exact-active,
    &.active {
        @apply bg-brand-400 text-brand-950 dark:bg-brand-800 dark:text-brand-50;
    }

    &.expanded {
        @apply gap-2 px-4;

        & .label {
            @apply block;
        }
    }
    &.mini {
        @apply w-[45px] justify-center;

        & .label {
            @apply hidden;
        }
    }
}
</style>
