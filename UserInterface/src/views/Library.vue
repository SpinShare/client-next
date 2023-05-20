<template>
    <AppLayout>
        <section class="view-library">
            <header>
                <h1>Library</h1>
            </header>
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
const emitter = inject('emitter');

const loadingLibrary = ref(false);
const library = ref([]);

onMounted(() => {
    setTimeout(() => {
        loadLibrary();
    }, 1000);
});

const loadLibrary = () => {
    window.external.sendMessage(JSON.stringify({
        command: "library-get",
        data: "",
    }));
    
    loadingLibrary.value = true;
};

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
    gap: 40px;

    & h1 {
        font-size: 1.5em;
        font-weight: 700;
    }
}
</style>