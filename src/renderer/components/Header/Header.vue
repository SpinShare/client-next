<template>
    <header>
        <div class="brand-and-back">
            <button
                class="button ghost"
                @click="handleBack"
                v-if="hasHistory"
            >
                <Remixicon icon="arrow-left" />
            </button>
            <RouterLink to="/">
                <SpinShareLogo class="brand" />
            </RouterLink>
        </div>
        <div class="search">
            <div class="search-box">
                <input
                    type="search"
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
import { useRouter } from 'vue-router';
import SpinShareLogo from '@/assets/images/logo_full.svg';
import Remixicon from '@/components/Remixicon.vue';
import { computed } from 'vue';
import AuthArea from '@/components/Header/AuthArea.vue';

const router = useRouter();

function handleBack() {
    router.go(-1);
}

const hasHistory = computed(() => {
    return window.history.state.back !== null;
});
</script>

<style scoped>
header {
    grid-column: 1 / -1;
    @apply grid grid-cols-[auto_1fr_auto] gap-2 items-center h-[60px] pl-3.25 pr-5 border-b border-base-800 justify-between;

    & .brand-and-back {
        @apply flex items-center gap-4;

        & .brand {
            @apply h-[30px] ml-2;
        }
    }
    & .search {
        @apply flex items-center justify-center;

        & .search-box {
            @apply h-[40px] flex overflow-hidden rounded-md relative min-w-[200px] w-full max-w-[500px] border border-base-800;

            & input {
                @apply grow px-4 absolute inset-0 font-sans bg-none transition-all;

                &:hover {
                    @apply bg-base-900;
                }
                &:focus {
                    @apply bg-base-900 outline-0;
                }
            }
        }
    }
    & nav {
        @apply flex gap-2 items-center justify-end;
    }
}
</style>
