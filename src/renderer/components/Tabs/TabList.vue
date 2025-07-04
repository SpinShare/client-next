<template>
    <section class="tab-list">
        <slot />
    </section>
</template>

<script setup>
</script>

<style scoped>
.tab-list {
    @apply flex px-10 items-center border-b border-base-300 dark:border-base-800 flex-wrap;
}
</style>
