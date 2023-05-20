<template>
    <section class="chart-detail-tab-playlists">
        Playlists: {{ id }}
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