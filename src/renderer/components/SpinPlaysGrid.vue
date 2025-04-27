<template>
    <section class="spinplays-grid">
        <slot />
    </section>
</template>

<script setup></script>

<style scoped>
.spinplays-grid {
    @apply p-10 grid grid-cols-1 gap-2.5;
}

@media screen and (min-width: 1100px) {
    .spinplays-grid {
        @apply grid-cols-2;
    }
}
@media screen and (min-width: 1300px) {
    .spinplays-grid {
        @apply grid-cols-3;
    }
}
@media screen and (min-width: 1800px) {
    .spinplays-grid {
        @apply grid-cols-4;
    }
}
</style>
