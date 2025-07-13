<template>
    <section class="setup-done">
        <SectionHeader :title="$t('setup.done.header')" />
        <p>{{ $t('setup.done.body') }}</p>
        <p class="tip">{{ $t('setup.done.tip') }}</p>
        <p class="mt-4" v-html="$t('setup.done.welcome')" />
    </section>
</template>

<script setup>
import SectionHeader from "@/components/SectionHeader.vue";
</script>

<style scoped>
.setup-done {
    @apply flex flex-col gap-2;

    & p {
        @apply text-base-500 dark:text-base-300;

        &.tip {
            @apply text-brand-700 dark:text-brand-300;
        }
    }
}
</style>
