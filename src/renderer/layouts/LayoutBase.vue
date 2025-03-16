<template>
    <Sidebar :expanded="isExpanded" />
    <transition
        name="default"
        mode="out-in"
    >
        <main>
            <button @click="isExpanded = !isExpanded">E</button>
            <slot />
        </main>
    </transition>
</template>

<script setup>
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { ref } from 'vue';

const isExpanded = ref(false);
</script>

<style>
#app {
    @apply grid grid-cols-[auto_1fr] grow overflow-hidden;
}
</style>

<style scoped>
@reference "@/assets/css/app.css";

main {
    @apply flex flex-col overflow-y-scroll;
}
</style>
