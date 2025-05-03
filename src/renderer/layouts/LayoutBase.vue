<template>
    <div class="layout-base">
        <Header />
        <Sidebar :expanded="isExpanded" />
        <transition
            name="default"
            mode="out-in"
        >
            <main v-show="true">
                <slot />
            </main>
        </transition>
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import Header from '@/components/Header/Header.vue';
import { useStorage } from '@vueuse/core';

const mitt = inject('mitt');
const isExpanded = useStorage('sidebar-extended', false);

onMounted(() => {
    mitt.on('toggle-sidebar-expanded', (expanded) => {
        isExpanded.value = expanded;
    });
});

onUnmounted(() => {
    mitt.off('toggle-sidebar-expanded');
});
</script>

<style scoped>
.layout-base {
    @apply grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] grow overflow-hidden;
}
main {
    @apply flex flex-col overflow-y-scroll;
}
</style>
