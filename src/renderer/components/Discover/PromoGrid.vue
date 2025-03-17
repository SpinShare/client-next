<template>
    <section class="promo-grid">
        <slot />
    </section>
</template>

<script setup></script>

<style>
@reference "@/assets/css/app.css";

.promo-grid {
    @apply grid grid-cols-1 gap-3;
}
@media screen and (min-width: 1100px) {
    .promo-grid {
        @apply grid-cols-2;
    }
}
</style>
