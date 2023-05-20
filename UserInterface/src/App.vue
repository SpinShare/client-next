<template>
    <router-view v-slot="{ Component, route }">
        <transition :name="route.path.includes('setup') ? 'setup' : 'default'" mode="out-in">
            <component :is="Component" :key="route.path" />
        </transition>
    </router-view>
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

.setup-enter-active {
    transition: all 0.2s ease-out;
}
.setup-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.setup-enter-from,
.setup-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

.default-enter-active {
    transition: all 0.15s ease-out;
}
.default-leave-active {
    transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}
.default-enter-from,
.default-leave-to {
    transform: scale(0.975);
    opacity: 0;
}
</style>
