<template>
    <div class="layout-base">
        <Sidebar :expanded="isExpanded" />
        <transition
            name="default"
            mode="out-in"
        >
            <main>
                <slot />
            </main>
        </transition>
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';

const mitt = inject('mitt');
const isExpanded = ref(false);

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
@reference "@/assets/css/app.css";

.layout-base {
    @apply grid grid-cols-[auto_1fr] grow overflow-hidden;
}
main {
    @apply flex flex-col overflow-y-scroll;
}
</style>
