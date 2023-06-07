<template>
    <router-view v-slot="{ Component, route }">
        <transition :name="route.path.includes('setup') ? 'setup' : 'default'" mode="out-in">
            <component :is="Component" :key="route.path" />
        </transition>
    </router-view>
</template>

<script setup>
import {ref, inject, onMounted} from 'vue';
const emitter = inject('emitter');

const theme = ref('dark');

window.external.receiveMessage((rawResponse) => {
    const response = JSON.parse(rawResponse);
    emitter.emit(response.Command, response.Data);
});

emitter.on('settings-get-response', (setting) => {
    if(setting.key === "app.theme") {
        setTheme(setting.data);
    }
});

emitter.on('update-theme', (newTheme) => {
    setTheme(newTheme);
})

onMounted(() => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-get",
        data: "app.theme",
    }));
});

const setTheme = (newTheme) => {
    theme.value = newTheme ?? 'light';
    document.documentElement.dataset.theme = theme.value;
};
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

.queue-enter-active {
    transition: all 0.15s ease-out;
}
.queue-leave-active {
    transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}
.queue-enter-from,
.queue-leave-to {
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

@keyframes loadingLoop {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
