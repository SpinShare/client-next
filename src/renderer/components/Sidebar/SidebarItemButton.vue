<template>
    <button :class="`item-button ${active ? 'active' : ''} ${expanded ? 'expanded' : 'mini'}`">
        <Remixicon
            :icon="icon"
            size="xl"
            :filled="active"
        />
        <span class="label">{{ label }}</span>
        <span
            class="badge"
            v-if="badge"
            >{{ badge }}</span
        >
    </button>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    badge: {
        type: [String, Number, Boolean],
        default: false,
    },
    expanded: {
        type: Boolean,
        default: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.item-button {
    @apply h-[45px] transition-all rounded flex items-center relative;

    &:hover {
        @apply bg-base-900 cursor-pointer;
    }
    &.active {
        @apply bg-brand-800 text-brand-50;
    }

    & .badge {
        @apply bg-brand-700 text-brand-50 rounded-md text-xs font-bold px-1.5 py-0.5;
    }

    &.expanded {
        @apply gap-2 px-4;

        & .label {
            @apply block grow text-left line-clamp-1;
        }
    }
    &.mini {
        @apply w-[45px] justify-center;

        & .label {
            @apply hidden;
        }
        & .badge {
            @apply absolute bottom-0 right-0;
        }
    }
}
</style>
