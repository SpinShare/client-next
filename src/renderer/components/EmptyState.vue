<template>
    <div class="empty-state">
        <Remixicon
            :icon="icon"
            size="3xl"
            filled
        />
        <span>{{ label }}</span>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';

defineProps({
    icon: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
});
</script>

<style scoped>
.empty-state {
    @apply flex flex-col items-center gap-1 py-5 text-base-400 border border-base-800 rounded-md;
}
</style>
