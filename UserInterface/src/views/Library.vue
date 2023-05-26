<template>
    <AppLayout>
        <section class="view-library">
            <SpinHeader
                label="Library"
            >
                <SpinButton
                    icon="folder"
                    @click="handleOpenLibrary"
                />
                <SpinButton
                    icon="plus"
                />
                <SpinButton
                    icon="refresh"
                    @click="handleRebuildCache"
                />
            </SpinHeader>
            <SpinLoader v-if="loadingLibrary" />
            <LibraryChartList
                :charts="library"
            />
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import AppLayout from "@/layouts/AppLayout.vue";
import LibraryChartList from "@/components/Library/LibraryChartList.vue";
import router from "@/router";
const emitter = inject('emitter');

const loadingLibrary = ref(false);
const library = ref([]);

onMounted(() => {
    loadLibrary();
});

const handleOpenLibrary = () => {
    window.external.sendMessage(JSON.stringify({
        command: "library-open-in-explorer",
        data: "",
    }));
};

const loadLibrary = () => {
    window.external.sendMessage(JSON.stringify({
        command: "library-get",
        data: "",
    }));
    
    loadingLibrary.value = true;
};

const handleRebuildCache = () => {
    // TODO: Custom Page
    router.push({ path: '/setup/step-2' });
}

emitter.on('library-get-response', (response) => {
    loadingLibrary.value = false;
    library.value = response;
});
</script>

<style lang="scss" scoped>
.view-library {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>