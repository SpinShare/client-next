<template>
    <transition name="slide-fade">
        <router-view></router-view>
    </transition>
</template>

<script setup>
import {inject} from 'vue';
const emitter = inject('emitter');

window.external.receiveMessage((rawResponse) => {
    const response = JSON.parse(rawResponse);
    emitter.emit(response.Command, response.Data);
});
</script>

<style lang="scss">
#app {
    width: 100%;
    height: 100%;
    display: grid;
    overflow: hidden;

    & > main {
        overflow-y: scroll;
    }
}

.slide-fade-enter-active {
    transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>
