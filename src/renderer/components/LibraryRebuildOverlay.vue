<template>
    <div
        class="overlay-cache-rebuild"
    >
        <Loader />

        <p class="mt-8 text-xl font-bold">{{ status?.percent }}%</p>
        <p class="text-base-600 dark:text-base-300">{{ status?.current }} / {{ status?.total }}</p>
    </div>
</template>
<script setup>
import Loader from '@/components/Loader.vue';

defineProps({
    status: {
        type: Object,
        default: null,
    },
});
</script>

<style scoped>
.overlay-cache-rebuild {
    @apply fixed inset-0 p-5 flex flex-col justify-center items-center z-100 backdrop-blur-md backdrop-brightness-90 dark:backdrop-brightness-75;
}
</style>