<template>
    <h1>User SpinPlays</h1>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const spinPlays = ref([]);

onMounted(() => {
    spinPlays.value = [];
});
</script>

<style scoped></style>
