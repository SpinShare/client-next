<template>
    <div class="controller-hints-footer">
        <main>
            <ControllerHint />
        </main>
        <aside>
            <ControllerHint />
            <ControllerHint />
        </aside>
    </div>
</template>

<style lang="scss">
.controller-hints-footer {
    width: 100%;
    height: 60px;
    background: #000;
    position: absolute;
    z-index: 1000;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>
<script setup>
import ControllerHint from '@/components/Console/ControllerHintsFooter/ControllerHint.vue';
</script>
