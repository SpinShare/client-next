<template>
    <section class="setup-done">
        <SectionHeader title="We're done!" />
        <p>You have now set up the SpinShare desktop client. You're only a click away from a library of thousands of custom created charts for Spin Rhythm XD.</p>
        <p class="tip">Tip: Click on the top right corner to log into your account. Logging in lets you review charts and add them to playlists comfortably without using the website. In the future, you'll also be able to upload your own custom charts.</p>
        <p class="mt-4">But for now, let's enter the <strong>rhythm dimension</strong>!</p>
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
