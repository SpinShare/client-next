<template>
    <div class="console-hints">
        <div class="left">
            <button @click="emit('toggleMenu')">MENU</button>
        </div>
        <div class="right">
            <button @click="emit('select')">SELECT</button>
            <button @click="emit('back')">BACK</button>
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['toggleMenu', 'select', 'back']);
</script>

<style lang="scss">
.console-hints {
    height: 60px;
    width: 100%;
    background: #000;
    display: flex;
    gap: 25px;
    padding: 0 25px;
    align-items: center;

    & .left {
        flex-grow: 1;
        display: flex;
        gap: 15px;
    }
    & .right {
        display: flex;
        gap: 15px;
    }
}
</style>
