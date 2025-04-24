<template>
    <button :class="`item-button ${expanded ? 'expanded' : 'mini'}`">
        <Remixicon
            :icon="icon"
            size="xl"
            :filled="active"
        />
        <span class="label">{{ label }}</span>
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
    @apply h-[45px] transition-all rounded flex items-center;

    &:hover {
        @apply bg-base-900 cursor-pointer;
    }
    &.active {
        @apply bg-brand-800 text-brand-50;
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
