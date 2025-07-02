<template>
    <div
        class="overlay-cache-rebuild"
        v-if="cacheRebuildActive && cacheRebuildStatus"
    >
        <Loader />

        <p class="mt-8 text-xl font-bold">{{ cacheRebuildStatus.percent }}%</p>
        <p class="text-base-500 dark:text-base-300">{{ cacheRebuildStatus.current }} / {{ cacheRebuildStatus.total }}</p>
    </div>
</template>
<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import Loader from '@/components/Loader.vue';

const mitt = inject('mitt');
const cacheRebuildActive = ref(false);
const cacheRebuildStatus = ref(null);

onMounted(() => {
    mitt.on('cache-rebuild-start', () => {
        cacheRebuildActive.value = true;
    });
    mitt.on('cache-rebuild-progress', (status) => {
        cacheRebuildStatus.value = status;
    });
    mitt.on('cache-rebuild-done', () => {
        cacheRebuildActive.value = false;
    });
});

onUnmounted(() => {
    mitt.off('cache-rebuild-start');
    mitt.off('cache-rebuild-progress');
    mitt.off('cache-rebuild-done');
});
</script>

<style scoped>
.overlay-cache-rebuild {
    @apply fixed inset-0 p-5 flex flex-col justify-center items-center z-100 backdrop-blur-md backdrop-brightness-75;
}
</style>