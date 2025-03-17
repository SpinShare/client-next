<template>
    <section class="tab-list">
        <slot />
    </section>
</template>

<script setup>
</script>

<style scoped>
@reference "@/assets/css/app.css";

.tab-list {
    @apply flex px-10 items-center border-b border-base-800;
}
</style>
