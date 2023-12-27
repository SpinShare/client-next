<template>
    <router-view v-slot="{ Component, route }">
        <transition
            :name="transitionName"
            mode="out-in"
        >
            <component
                :is="Component"
                :key="route.path"
            />
        </transition>
    </router-view>

    <UpdateBanner />
    <AlertMessage />
</template>

<script setup>
import './layout_desktop/assets/app.scss';
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UpdateBanner from '@/layout_desktop/components/UpdateBanner.vue';
import AlertMessage from '@/layout_desktop/components/Common/AlertMessage.vue';
const emitter = inject('emitter');

const router = useRouter();
const language = ref('en');
const theme = ref('dark');
const transitionName = ref('default');

window.external.receiveMessage((rawResponse) => {
    const response = JSON.parse(rawResponse);
    emitter.emit(response.Command, response.Data);
});

emitter.on('settings-get-response', (setting) => {
    if (setting.key === 'app.theme') {
        setTheme(setting.data);
    }
    if (setting.key === 'app.language') {
        setLanguage(setting.data);
    }
});

emitter.on('update-theme', (newTheme) => {
    setTheme(newTheme);
});

onMounted(() => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'settings-get',
            data: 'app.theme',
        }),
    );
});

const setTheme = (newTheme) => {
    let osTheme = window.matchMedia('(prefers-color-scheme: dark').matches
        ? 'dark'
        : 'light';
    theme.value = newTheme ?? osTheme;
    document.documentElement.dataset.theme = theme.value;
};

const setLanguage = (newLanguage) => {
    let osLanguage = window.navigator.language?.substring(0, 2) ?? 'en';
    language.value = newLanguage ?? osLanguage;
};

router.beforeEach((to, from) => {
    let newTransitionName = 'default';

    if (to.path.includes('setup')) newTransitionName = 'setup';

    // No transition for pagination in discover lists
    if (to.path.includes('discover/new') && from.path.includes('discover/new'))
        newTransitionName = 'none';
    if (
        to.path.includes('discover/updated') &&
        from.path.includes('discover/updated')
    )
        newTransitionName = 'none';
    if (
        to.path.includes('discover/hotThisWeek') &&
        from.path.includes('discover/hotThisWeek')
    )
        newTransitionName = 'none';
    if (
        to.path.includes('discover/hotThisMonth') &&
        from.path.includes('discover/hotThisMonth')
    )
        newTransitionName = 'none';

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
</style>
