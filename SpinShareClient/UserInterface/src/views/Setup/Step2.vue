<template>
    <SetupLayout
        :step="2"
        :title="t('setup.step2.title')"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="libraryCacheIsReady"
    >
        <p>{{ t('setup.step2.text') }}</p>
        
        <SpinButton
            :color="libraryCacheIsReady ? 'success' : 'default'"
            :disabled="libraryCacheIsAnalyzing || libraryCacheIsReady"
            :loading="libraryCacheIsAnalyzing"
            :label="analyzeButtonLabel"
            @click="buildLibraryCache"
        />
    </SetupLayout>
</template>

<script setup>
import {ref, inject, computed} from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const libraryCacheIsAnalyzing = ref(false);
const libraryCacheIsReady = ref(false);
const libraryCacheProgressCurrent = ref(0);
const libraryCacheProgressTotal = ref(0);
const libraryCacheProgressPercentage = ref(0.0);

const buildLibraryCache = () => {
    libraryCacheIsAnalyzing.value = true;
    
    window.external.sendMessage(JSON.stringify({
        command: "library-build-cache",
        data: [],
    }));
};

emitter.on('library-build-cache-response', (status) => {
    libraryCacheIsAnalyzing.value = false;
    libraryCacheIsReady.value = status === 'ready';
});

emitter.on('library-build-cache-progress-response', (progress) => {
    libraryCacheProgressCurrent.value = progress.Current;
    libraryCacheProgressTotal.value = progress.Total;
    libraryCacheProgressPercentage.value = progress.Percentage;
});

const handleBack = () => {
    router.push({ path: '/setup/step-1' });
};
const handleContinue = () => {
    router.push({ path: '/setup/step-3' });
};

const analyzeButtonLabel = computed(() => {
    if(libraryCacheIsReady.value)
        return t('setup.step2.libraryCache.analyzationDone', [libraryCacheProgressTotal.value]);
    
    if(libraryCacheIsAnalyzing.value)
        return t('setup.step2.libraryCache.analyzing', [libraryCacheProgressPercentage.value])
    
    return t('setup.step2.libraryCache.analyze');
});
</script>