<template>
    <section class="layout-app">
        <SidebarNavigation v-if="!window.spinshare.settings.IsConsole" />

        <main>
            <slot />
        </main>
    </section>
</template>

<script setup>
import SidebarNavigation from '@/components/SidebarNavigation.vue';
import { inject, onMounted } from 'vue';
const emitter = inject('emitter');

onMounted(() => {
  if (window.spinshare.settings.IsConsole) {
        document.body.classList.add("ui-console");
    
        emitter.emit('console-update-controller-hints', {
            showMenu: false,
            items: [],
        });
    }
});
</script>

<style lang="scss" scoped>
.layout-app {
    width: 100%;
    height: 100%;
    display: grid;
    overflow: hidden;
    grid-template-columns: 60px 1fr;

    & > main {
        overflow-y: auto;
    }
}

.ui-console .layout-app {
   grid-template-columns: 1fr;
}
</style>
