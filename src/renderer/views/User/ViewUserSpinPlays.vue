<template>
    <LayoutBase>
        <h1>User SpinPlays</h1>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { onMounted, ref } from 'vue';

const spinPlays = ref([]);

onMounted(() => {
    spinPlays.value = [];
});
</script>

<style scoped></style>
