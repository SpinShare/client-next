<template>
    <section class="chart-detail-tab-reviews">
        Reviews: {{ id }}
    </section>
</template>

<script setup>
const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});
</script>