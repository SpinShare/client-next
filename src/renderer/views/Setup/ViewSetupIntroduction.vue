<template>
    <section class="setup-introduction">
        <div class="logo">
            <SpinShareLogo />
        </div>
        <p>Thank you for downloading the SpinShare desktop client! Before you can begin downloading charts from the SpinShare community, we need to go through our initial setup.</p>
    </section>
</template>

<script setup>
import SpinShareLogo from '@/assets/images/logo_full.svg';
</script>

<style scoped>
.setup-introduction {
    @apply flex flex-col gap-2;

    & .logo {
        @apply py-10 flex justify-center items-center;

        & svg {
            @apply h-[50px];
        }
    }
    & p {
        @apply text-base-500 dark:text-base-300;
    }
}
</style>
