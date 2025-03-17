<template>
    <section class="chart-grid">
        <slot />
    </section>
</template>

<script setup></script>

<style>
@reference "@/assets/css/app.css";

.chart-grid {
    @apply grid grid-cols-1 gap-5 px-10;
}
@media screen and (min-width: 1100px) {
    .chart-grid {
        @apply grid-cols-2;
    }
}
</style>
