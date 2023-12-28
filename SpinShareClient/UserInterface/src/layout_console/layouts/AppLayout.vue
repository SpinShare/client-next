<template>
    <section class="layout-app">
        <main>
            <slot />
        </main>
    </section>
</template>

<script setup></script>

<style lang="scss" scoped>
.layout-app {
    width: 100%;
    height: 100%;
    display: grid;
    overflow: hidden;
    grid-template-columns: 1fr;

    & > main {
        overflow-y: auto;
    }
}
</style>
