<template>
    <transition name="popup">
        <div
            v-if="isOpen"
            class="bp-search-backdrop"
            @click.self="close"
        >
            <div
                class="bp-search"
                data-nav-scope
                @nav-back.prevent="close"
            >
                <h1>
                    <Remixicon
                        icon="search"
                        size="xl"
                    />
                    <span>{{ $t('bigPicture.search.header') }}</span>
                </h1>
                <div class="types">
                    <button
                        v-for="type in types"
                        :key="type.value"
                        :class="['type', { active: searchType === type.value }]"
                        @click="searchType = type.value"
                        v-interactable
                    >
                        <Remixicon
                            :icon="type.icon"
                            :filled="searchType === type.value"
                        />
                        <span>{{ $t(type.label) }}</span>
                    </button>
                </div>
                <div class="field">
                    <Remixicon
                        icon="search"
                        size="2xl"
                    />
                    <input
                        ref="input"
                        type="search"
                        v-model="query"
                        :placeholder="$t('header.search.placeholder')"
                        data-nav-autofocus
                        @keyup.enter="submit"
                        v-interactable
                    />
                </div>
                <div class="actions">
                    <button
                        class="button"
                        @click="close"
                        v-interactable
                    >
                        <span>{{ $t('bigPicture.search.cancel') }}</span>
                    </button>
                    <button
                        class="button brand"
                        :disabled="query.trim() === ''"
                        @click="submit"
                        v-interactable
                    >
                        <Remixicon icon="search" />
                        <span>{{ $t('bigPicture.search.submit') }}</span>
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { inject, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Remixicon from '@/components/Remixicon.vue';
import { gamepadState } from '@/modules/gamepad/state';

const mitt = inject('mitt');
const navigation = inject('navigation');
const router = useRouter();
const route = useRoute();

const isOpen = ref(false);
const query = ref('');
const searchType = ref('charts');
const input = ref(null);

const types = [
    { value: 'charts', label: 'header.search.type.charts', icon: 'music-2' },
    { value: 'playlists', label: 'header.search.type.playlists', icon: 'album' },
    { value: 'users', label: 'header.search.type.users', icon: 'user-3' },
];

async function open() {
    if (isOpen.value) return;
    query.value = route.path === '/discover/search' ? route.query.query || '' : '';
    searchType.value = route.path === '/discover/search' ? route.query.type || 'charts' : 'charts';
    isOpen.value = true;
    await nextTick();
    navigation.ensureFocus();
    if (gamepadState.inputMode === 'gamepad') navigation.handleAction('accept', { pointer: true });
}

function close() {
    isOpen.value = false;
    nextTick(() => navigation.ensureFocus());
}

function submit() {
    const trimmed = query.value.trim();
    if (!trimmed) return;
    isOpen.value = false;
    router.push(`/discover/search?type=${searchType.value}&query=${encodeURIComponent(trimmed)}`);
}

onMounted(() => {
    mitt.on('bp-search-open', open);
});

onUnmounted(() => {
    mitt.off('bp-search-open', open);
});
</script>

<style scoped>
.bp-search-backdrop {
    @apply fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-md backdrop-brightness-50;

    & .bp-search {
        @apply bg-base-100 dark:bg-base-900 rounded-2xl p-8 w-full max-w-[760px] flex flex-col gap-5 shadow-2xl border border-base-200 dark:border-base-800 -mt-[52px];

        & h1 {
            @apply flex items-center gap-3 text-2xl font-bold;

            & .icon {
                @apply text-brand-500;
            }
        }
        & .field {
            @apply flex items-center gap-3 h-[64px] px-5 rounded-md border border-base-300 dark:border-base-800 bg-base-50 dark:bg-base-950;

            & input {
                @apply grow h-full bg-transparent text-2xl outline-none;
            }
            &:focus-within {
                outline: 4px solid var(--color-brand);
                outline-offset: 3px;
            }
        }
        & .types {
            @apply grid grid-cols-3 gap-2;

            & .type {
                @apply flex items-center justify-center gap-2 h-[48px] rounded bg-base-200 dark:bg-base-800 transition-all cursor-pointer;

                &:hover {
                    @apply bg-base-300 dark:bg-base-700;
                }
                &.active {
                    @apply bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50;
                }
            }
        }
        & .actions {
            @apply flex justify-end gap-2;
        }
    }
}
</style>
