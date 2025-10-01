<template>
    <section class="promo-grid">
        <slot />
    </section>
</template>

<script setup></script>

<style scoped>
.promo-grid {
    @apply flex flex-col gap-3;
}
@media screen and (min-width: 1100px) {
    .promo-grid {
        @apply grid grid-cols-2;
    }
}
</style>
