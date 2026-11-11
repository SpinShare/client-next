<template>
    <section class="bp-shelf">
        <header>
            <h2>{{ title }}</h2>
        </header>
        <div
            class="row"
            data-nav-group
        >
            <template v-if="loading">
                <div
                    v-for="n in 6"
                    :key="n"
                    class="card-placeholder"
                ></div>
            </template>
            <template v-else>
                <slot />
                <RouterLink
                    v-if="to"
                    :to="to"
                    class="see-all-card"
                    v-interactable
                >
                    <span class="circle">
                        <Remixicon
                            icon="arrow-right"
                            size="3xl"
                        />
                    </span>
                    <span class="label">{{ $t('bigPicture.home.seeAll') }}</span>
                    <span class="title">{{ title }}</span>
                </RouterLink>
            </template>
        </div>
    </section>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';

defineProps({
    title: {
        type: String,
        required: true,
    },
    to: {
        type: [String, Boolean],
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.bp-shelf {
    @apply flex flex-col gap-3;

    & header {
        @apply flex items-end justify-between px-10;

        & h2 {
            @apply text-2xl font-bold;
        }
    }

    & .row {
        @apply flex gap-4 overflow-x-auto px-10 py-5 -my-2;
        scrollbar-width: none;
        scroll-padding-inline: 40px;

        & > :deep(*) {
            @apply shrink-0;
        }
        & > :deep(.chart-item) {
            @apply w-[200px];
        }
    }

    & .card-placeholder {
        @apply w-[200px] h-[290px] rounded-lg bg-base-200 dark:bg-base-900 animate-pulse;
    }

    & .see-all-card {
        @apply w-[200px] rounded-lg flex flex-col items-center justify-center gap-1 p-4 text-center transition-all;
        @apply bg-base-200 dark:bg-base-900 text-base-900 dark:text-base-50;

        & .circle {
            @apply w-16 h-16 mb-3 rounded-full flex items-center justify-center bg-base-300 dark:bg-base-800 transition-transform;
        }
        & .label {
            @apply text-lg font-bold;
        }
        & .title {
            @apply text-sm text-base-600 dark:text-base-300 line-clamp-2;
        }

        &:hover,
        &:focus {
            @apply bg-base-300 dark:bg-base-800;

            & .circle {
                @apply bg-base-400 dark:bg-base-700 scale-110;
            }
        }
    }
}
</style>
