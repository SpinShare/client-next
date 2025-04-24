<template>
    <div class="layout-setup">
        <main>
            <slot />
        </main>
    </div>
</template>

<script setup></script>

<style scoped>
.layout-setup {
    @apply flex items-center justify-center grow overflow-hidden;
}
main {
    @apply bg-base-800 rounded p-4;
}
</style>
