<template>
    <LayoutBase>
        <template v-if="isLoading">
            <section class="section-center">
                <Loader />
            </section>
        </template>
        <template v-else>
            <template v-if="searchType === 'charts'">
                CHART RESULT {{ results }}
            </template>
            <template v-if="searchType === 'playlists'">
                PLAYLIST RESULT {{ results }}
            </template>
            <template v-if="searchType === 'users'">
                USERS RESULT {{ results }}
            </template>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import {useRoute} from "vue-router";
import {computed, inject, onMounted, ref, watch} from "vue";
import Loader from "@/components/Loader.vue";

const api = inject('api');
const route = useRoute();
const searchType = computed(() => route.params.type);
const searchQuery = computed(() => route.params.query);

const isLoading = ref(false);
const results = ref([]);

async function loadResults() {
    isLoading.value = true;
    results.value = [];

    //api

    // ...

    //isLoading.value = false;
}

onMounted(() => {
    loadResults();
});
watch(() => [searchType, searchQuery], () => {
    loadResults();
});
</script>

<style scoped></style>
