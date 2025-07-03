<template>
    <header class="main">
        <div class="brand-and-back">
            <button
                class="button ghost"
                @click="handleBack"
                v-if="hasHistory"
                v-interactable
            >
                <Remixicon icon="arrow-left" />
            </button>
            <RouterLink
                to="/"
                v-interactable
            >
                <SpinShareLogo class="brand" />
            </RouterLink>
        </div>
        <div class="search">
            <div class="search-box">
                <select
                    v-interactable
                    v-model="searchType"
                >
                    <option value="charts">Charts</option>
                    <option value="playlists">Playlists</option>
                    <option value="users">Users</option>
                </select>
                <input
                    v-interactable
                    type="search"
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                    placeholder="Search for a chart, charter, or playlist..."
                />
            </div>
        </div>
        <nav>
            <AuthArea />
        </nav>
    </header>
</template>

<script setup>
import {useRoute, useRouter} from 'vue-router';
import SpinShareLogo from '@/assets/images/logo_full.svg';
import Remixicon from '@/components/Remixicon.vue';
import {computed, ref} from 'vue';
import AuthArea from '@/components/Header/AuthArea.vue';

const router = useRouter();
const route = useRoute();

const searchType = ref(route.params.type || 'charts');
const searchQuery = ref(route.params.query || '');

function handleBack() {
    router.go(-1);
}

function handleSearch() {
    // Prevent empty searches
    if(searchQuery.value === '') return;
    router.push(`/discover/search/${searchType.value}/${searchQuery.value}`);
}

const hasHistory = computed(() => {
    return window.history.state.back !== null;
});
</script>

<style scoped>
header.main {
    grid-column: 1 / -1;
    @apply grid grid-cols-[auto_1fr_auto] gap-2 items-center h-[60px] pl-3.25 pr-5 border-b border-base-300 dark:border-base-800 justify-between;

    & .brand-and-back {
        @apply flex items-center gap-4;

        & .brand {
            @apply h-[30px] ml-2;
        }
    }
    & .search {
        @apply flex items-center justify-center;

        & .search-box {
            @apply h-[40px] flex gap-0 rounded-md relative min-w-[200px] w-full max-w-[500px] border border-base-300 dark:border-base-800;

            & select {
                @apply px-2 border-r border-base-300 dark:border-base-800 appearance-none pr-8;

                &:hover, &:focus {
                    @apply bg-base-100 dark:bg-base-900 outline-0;
                }

                & option {
                    @apply bg-base-200 dark:bg-base-900;
                }

                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(0,0,0,1)'%3E%3Cpath d='M12 15.0006L7.75732 10.758L9.17154 9.34375L12 12.1722L14.8284 9.34375L16.2426 10.758L12 15.0006Z'%3E%3C/path%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 4px top 60%;
                background-size: 24px 24px;
            }
            & input {
                @apply grow px-4 font-sans bg-none transition-all;

                &:hover, &:focus {
                    @apply bg-base-100 dark:bg-base-900 outline-0;
                }
            }
        }
    }
    & nav {
        @apply flex gap-2 items-center justify-end;
    }
}
</style>

<style>
html[data-theme="dark"] header.main select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255,255,255,1)'%3E%3Cpath d='M12 15.0006L7.75732 10.758L9.17154 9.34375L12 12.1722L14.8284 9.34375L16.2426 10.758L12 15.0006Z'%3E%3C/path%3E%3C/svg%3E") !important;
}
</style>