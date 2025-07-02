<template>
    <section class="setup-cache">
        <SectionHeader title="Library cache" />
        <p>To easily display whether you already have a chart installed and whether an update is available, a cache needs to be build.</p>
        <p>This cache goes through your games custom charts folder and creates a smaller text file with all existing charts, it also creates a small thumbnail of the album art so your browsing experience is more stable, even with many charts installed.</p>
        <p>If you did not install any Spin Rhythm XD custom charts yet, this step will be instant. If you have a very large library, it may take up to a minute.</p>
        <p class="tip">Tip: You can always re-analyze your library on the library tab.</p>

        <button
            class="button success"
            disabled
            v-if="cacheDone"
        >
            <Remixicon icon="check" />
            <span>Analyzation done!</span>
        </button>
        <button
            @click="handleAnalyze"
            class="button brand"
            v-else
        >
            <Remixicon icon="refresh" />
            <span>Analyze your library</span>
        </button>
    </section>
</template>

<script setup>
import SectionHeader from "@/components/SectionHeader.vue";
import Remixicon from "@/components/Remixicon.vue";
import {inject, onMounted, onUnmounted, ref} from "vue";

const cacheDone = ref(false);
const libraryManager = inject('libraryManager');
const mitt = inject('mitt');

onMounted(async () => {
    mitt.on('cache-change', () => {
        cacheDone.value = true;
    });
});

onUnmounted(() => {
    mitt.off('cache-change');
});

function handleAnalyze() {
    libraryManager.rebuild();
}
</script>

<style scoped>
.setup-cache {
    @apply flex flex-col gap-2;

    & p {
        @apply text-base-500 dark:text-base-300;

        &.tip {
            @apply text-brand-700 dark:text-brand-300;
        }
    }

    & .button {
        @apply mt-6 self-center;
    }
}
</style>
