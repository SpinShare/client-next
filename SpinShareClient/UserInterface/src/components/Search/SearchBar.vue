<template>
    <section class="search-bar">
        <SpinSelect
            :disabled="isSearching"
            v-model="searchInputType"
            :options="[
                { value: 'charts', icon: 'album', label: 'Charts' },
                { value: 'playlists', icon: 'playlist-music', label: 'Playlists' },
                { value: 'users', icon: 'account-circle', label: 'Users' },
            ]"
        />
        <input
            type="search"
            placeholder="Search query..."
            v-model="searchInputQuery"
            @keyup.enter="handleSearch"
            :disabled="isSearching"
        />
        <transition name="default">
            <SearchFilters
                v-if="searchInputType === 'charts'"
                :disabled="isSearching"
                v-model="searchInputFilters"
            />
        </transition>
        <SpinButton
            icon="magnify"
            label="Search"
            color="primary"
            :disabled="isSearching || !canSearch"
            @click="handleSearch"
        />
    </section>
</template>

<script setup>
import {computed, ref} from "vue";
import SearchFilters from "@/components/Search/SearchFilters.vue";

const emit = defineEmits(['search']);

defineProps({
    isSearching: {
        type: Boolean,
        default: false,
    }
});

const searchInputType = ref("charts");
const searchInputQuery = ref("");
const searchInputFilters = ref({
    showExplicit: true,
});

const handleSearch = () => {
    emit('search', {
        type: searchInputType.value,
        query: searchInputQuery.value,
        filters: searchInputFilters.value,
    });
};

const canSearch = computed(() => {
    return searchInputQuery.value.length > 2
});
</script>

<style lang="scss" scoped>
.search-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 20px 40px;
    border-bottom: 1px solid rgba(var(--colorBaseText),0.07);

    & input[type="search"] {
        flex-grow: 1;
        background: rgba(var(--colorBaseText), 0.07);
        border: 0;
        color: rgb(var(--colorBaseText));
        font-family: 'Work Sans', sans-serif;
        font-size: 1rem;
        border-radius: 4px;
        padding: 0 15px;
        height: 40px;
        transition: 0.15s ease-in-out all;

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        &:not(:disabled):hover {
            background: rgba(var(--colorBaseText), 0.14);
        }
    }
}
</style>
