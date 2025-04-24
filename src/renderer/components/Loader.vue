<template>
    <div
        class="loader"
        :style="`width: ${size}px; height: ${size}px; border-width: ${borderWidth}px;`"
    ></div>
</template>

<script setup>
defineProps({
    size: {
        type: Number,
        default: 48,
    },
    borderWidth: {
        type: Number,
        default: 6,
    },
});
</script>

<style scoped>
.loader {
    @apply rounded-full border-[6px] border-base-800 border-l-base-50 animate-spin;
}
</style>
