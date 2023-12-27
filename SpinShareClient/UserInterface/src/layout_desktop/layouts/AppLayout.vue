<template>
    <section class="layout-app">
        <SidebarNavigation />
    
        <main>
            <slot />
        </main>
    </section>
</template>

<script setup>
import SidebarNavigation from "@/layout_desktop/components/SidebarNavigation.vue";
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
</style>
