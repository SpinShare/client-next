<template>
    <header>
        <h1>{{ title }}</h1>
        <div class="actions">
            <slot />
        </div>
    </header>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>

<style scoped>
@reference "@/assets/css/app.css";

header {
    @apply flex gap-2 items-center;

    & h1 {
        @apply grow text-2xl font-bold;
    }
    & .actions {
        @apply flex items-center gap-1;
    }
}
</style>
