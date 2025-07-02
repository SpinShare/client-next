<template>
    <button class="promo-item-placeholder">
        <div class="banner"></div>
        <div class="content">
            <h5><span></span><span></span></h5>
            <h1><span></span><span></span><span></span><span></span></h1>
        </div>
    </button>
</template>

<script setup>
</script>

<style scoped>
.promo-item-placeholder {
    @apply bg-base-200 dark:bg-base-900 rounded-md overflow-hidden transition-all cursor-pointer text-left;

    & .banner {
        @apply bg-base-100 dark:bg-base-800 animate-pulse;
        height: 200px;
    }
    & .content {
        @apply flex flex-col p-4;

        & h5 {
            @apply text-base-500 flex items-center w-full gap-2 mb-3 mt-1;

            & span {
                &:nth-child(1) {
                    @apply w-[45px];
                }
                &:nth-child(2) {
                    @apply w-[90px];
                }
            }
        }
        & h1 {
            @apply flex items-center w-full gap-2 mb-1;

            & span {
                @apply h-[16px] bg-base-400 dark:bg-base-700;

                &:nth-child(1) {
                    @apply w-[80px];
                }
                &:nth-child(2) {
                    @apply w-[40px];
                }
                &:nth-child(3) {
                    @apply w-[80px];
                }
                &:nth-child(4) {
                    @apply w-[25px];
                }
            }
        }

        & span {
            @apply h-[12px] w-[50px] bg-base-300 dark:bg-base-800 rounded-full animate-pulse;
        }
    }
}
</style>
