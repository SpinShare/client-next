<template>
    <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
        </transition>
    </router-view>
</template>

<script setup>
import {ref, inject, onMounted, computed} from 'vue';
import {useRoute, useRouter} from "vue-router";
const emitter = inject('emitter');

const router = useRouter();
const route = useRoute();
const theme = ref('dark');
const transitionName = ref('default');

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

router.beforeEach((to, from) => {
    let newTransitionName = 'default';

    if(to.path.includes('setup')) newTransitionName = 'setup';
    
    // No transition for pagination in discover lists
    if(to.path.includes('discover/new') && from.path.includes('discover/new')) newTransitionName = 'none';
    if(to.path.includes('discover/updated') && from.path.includes('discover/updated')) newTransitionName = 'none';
    if(to.path.includes('discover/hotThisWeek') && from.path.includes('discover/hotThisWeek')) newTransitionName = 'none';
    if(to.path.includes('discover/hotThisMonth') && from.path.includes('discover/hotThisMonth')) newTransitionName = 'none';
    
    transitionName.value = newTransitionName;
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
