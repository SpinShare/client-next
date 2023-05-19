<template>
    <SetupLayout
        :step="2"
        title="Library Cache"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="libraryCacheIsReady"
    >
        <p>Next, let's strike up the band on the library cache. The cache keeps an up-to-the-minute record of all your installed charts and their versions. This way, SpinShare can quickly confirm if you've got a chart installed or if there's a new version waiting in the wings.</p>
        
        <SpinButton
            :color="libraryCacheIsReady ? 'success' : 'default'"
            :disabled="libraryCacheIsAnalyzing || libraryCacheIsReady"
            :loading="libraryCacheIsAnalyzing"
            label="Analyze library"
            @click="buildLibraryCache"
        />
    </SetupLayout>
</template>

<script setup>
import { ref, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
const emitter = inject('emitter');

const libraryCacheIsAnalyzing = ref(false);
const libraryCacheIsReady = ref(false);

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

const handleBack = () => {
    router.push({ path: '/setup/step-1' });
};
const handleContinue = () => {
    router.push({ path: '/setup/step-3' });
};
</script>