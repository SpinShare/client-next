<template>
    <div class="chart-item">
        <div class="cover"></div>
        <div class="content">
            <div class="meta">
                <h2>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </h2>
                <p>
                    <span></span>
                    <span></span>
                </p>
            </div>
            <div class="info">
                <div class="difficulties"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.chart-item {
    @apply bg-base-200 dark:bg-base-900 blur-none relative rounded-md overflow-hidden transition-all text-left p-2 grid grid-cols-[auto_1fr] gap-4 items-center;

    & .cover {
        @apply aspect-square w-[80px] rounded bg-base-300 dark:bg-base-800 animate-pulse;
    }
    & .content {
        @apply flex flex-col gap-3;

        & .meta {
            @apply flex flex-col;

            & h2 {
                @apply mb-[4px] flex items-center w-full gap-2;

                & span {
                    @apply bg-base-400 dark:bg-base-700;

                    &:nth-child(1) {
                        @apply w-[35px];
                    }
                    &:nth-child(2) {
                        @apply w-[75px];
                    }
                    &:nth-child(3) {
                        @apply w-[40px];
                    }
                    &:nth-child(4) {
                        @apply w-[80px];
                    }
                }
            }
            & p {
                @apply flex items-center w-full gap-2;

                & span {
                    &:nth-child(1) {
                        @apply w-[75px];
                    }
                    &:nth-child(2) {
                        @apply w-[110px];
                    }
                }
            }
            & span {
                @apply h-[14px] w-[50px] bg-base-300 dark:bg-base-800 rounded-full animate-pulse;
            }
        }
        & .info {
            @apply flex flex-wrap gap-2;

            & .difficulties {
                @apply flex flex-wrap gap-1 items-center h-[20px] bg-base-300 dark:bg-base-800 w-full rounded max-w-[100px] animate-pulse;
            }
        }
    }
}
</style>
