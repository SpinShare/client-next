<template>
    <section class="setup-cache">
        <SectionHeader :title="$t('setup.cache.header')" />
        <p>{{ $t('setup.cache.body') }}</p>
        <p>{{ $t('setup.cache.explanation') }}</p>
        <p>{{ $t('setup.cache.timeNeeded') }}</p>
        <p class="tip">{{ $t('setup.cache.tip') }}</p>

        <button
            class="button success"
            disabled
            v-if="cacheDone"
        >
            <Remixicon icon="check" />
            <span>{{ $t('setup.cache.done') }}</span>
        </button>
        <button
            @click="handleAnalyze"
            class="button brand"
            v-else
        >
            <Remixicon icon="refresh" />
            <span>{{ $t('setup.cache.analyze') }}</span>
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
