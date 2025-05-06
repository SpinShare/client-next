<template>
    <button
        :class="`item-expanded-toggle ${expanded ? 'expanded' : 'mini'}`"
        @click="toggleExpanded"
        v-interactable
    >
        <Remixicon
            v-if="!expanded"
            icon="sidebar-unfold"
            size="xl"
        />
        <Remixicon
            v-if="expanded"
            icon="sidebar-fold"
            size="xl"
        />
        <span class="label">Toggle Sidebar</span>
    </button>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import { inject } from 'vue';

const mitt = inject('mitt');
const props = defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

function toggleExpanded() {
    mitt.emit('toggle-sidebar-expanded', !props.expanded);
}
</script>

<style scoped>
.item-expanded-toggle {
    @apply h-[45px] transition-all rounded flex items-center;

    &:hover {
        @apply bg-base-900 cursor-pointer;
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
