<template>
    <SetupLayout
        :step="0"
        title="Welcome!"
        @continue="handleContinue"
    >
        <img src="@/assets/setup_start.svg" />
        <p>Welcome to SpinShare! Before we dive into the exhilarating world of Spin Rhythm XD charts, we'll need to set up a few things first. This includes designating your game paths, initializing a library cache, and tweaking other settings.</p>
    </SetupLayout>
</template>

<script setup>
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";

const handleContinue = () => {
    router.push({ path: '/setup/step-1' });
};
</script>