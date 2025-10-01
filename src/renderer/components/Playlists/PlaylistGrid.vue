<template>
    <section :class="`playlist-grid ${singleColumn ? 'single-column' : ''}`">
        <slot />
    </section>
</template>

<script setup>
defineProps({
    singleColumn: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.playlist-grid {
    @apply flex flex-col gap-3;
}
@media screen and (min-width: 1100px) {
    .playlist-grid:not(.single-column) {
        @apply grid grid-cols-2;
    }
}
</style>
