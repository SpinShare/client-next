<template>
    <h1>Chart Detail</h1>
    {{ chart }}
</template>

<script setup>
defineProps({
    chart: {
        type: Object,
        default: null,
    },
});
</script>

<style scoped>
@reference "@/assets/css/app.css";
</style>
