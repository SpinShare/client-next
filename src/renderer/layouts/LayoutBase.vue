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
        <AudioPlayer />
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import Header from '@/components/Header/Header.vue';
import AudioPlayer from '@/components/AudioPlayer.vue';
import { useStorage } from '@vueuse/core';

const mitt = inject('mitt');
const cacheRebuildActive = ref(false);
const cacheRebuildStatus = ref(null);
const isExpanded = useStorage('sidebar-extended', false);

onMounted(() => {
    mitt.on('toggle-sidebar-expanded', (expanded) => {
        isExpanded.value = expanded;
    });
    mitt.on('cache-rebuild-start', () => {
        cacheRebuildActive.value = true;
    });
    mitt.on('cache-rebuild-progress', (status) => {
        cacheRebuildStatus.value = status;
    });
    mitt.on('cache-rebuild-done', () => {
        cacheRebuildActive.value = false;
    });
});

onUnmounted(() => {
    mitt.off('toggle-sidebar-expanded');
    mitt.off('cache-rebuild-start');
    mitt.off('cache-rebuild-progress');
    mitt.off('cache-rebuild-done');
});
</script>

<style scoped>
.layout-base {
    @apply grid grid-cols-[auto_1fr] grow overflow-hidden;
    grid-template-rows: auto 1fr auto;
    position: relative;
}
.overlay-cache-rebuild {
    @apply fixed inset-0 p-5 flex flex-col justify-center items-center z-100 backdrop-blur-md backdrop-brightness-75;
}
main {
    @apply flex flex-col overflow-y-scroll;
    grid-column: 2;
    grid-row: 2;
}
</style>
