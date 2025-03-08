<template>
    <main>
        <slot />
    </main>
</template>

<script setup></script>

<style scoped>
@reference "@css/app.css";

main {
    @apply bg-base-850;
}
</style>
