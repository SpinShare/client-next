<template>
    <div
        v-if="open"
        class="console-menu-shade"
        @click.self="emit('closeMenu')"
    >
        <aside class="console-menu">Menu</aside>
    </div>
</template>

<script setup>
const emit = defineEmits(['closeMenu']);

defineProps({
    open: {
        type: Boolean,
        default: false,
    },
});
</script>

<style lang="scss">
.console-menu-shade {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 50px;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.6);

    & .console-menu {
        background: rgba(0, 0, 0, 1);
        padding: 25px;
        width: 400px;
        height: 100%;
        position: relative;
    }
}
</style>
