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

    <ControllerHintsFooter v-if="window.spinshare.settings.IsConsole" />

    <UpdateBanner />
    <AlertMessage />
</template>

<script setup>
import './assets/app.scss';
import { ref, inject, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import UpdateBanner from '@/components/UpdateBanner.vue';
import AlertMessage from '@/components/Common/AlertMessage.vue';
import ControllerHintsFooter from '@/components/Console/ControllerHintsFooter/ControllerHintsFooter.vue';
import useGamepad, { Buttons, focusableElements } from '@/modules/useGamepad';
import useInterfaceAudio, {
    InterfaceSounds,
} from '@/modules/useInterfaceAudio';
const emitter = inject('emitter');

const router = useRouter();
// eslint-disable-next-line no-undef
const language = ref(window.spinshare.settings.Language);
// eslint-disable-next-line no-undef
const theme = ref(window.spinshare.settings.Theme);
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

if (window.spinshare.settings.IsConsole) {
    const gamepad = useGamepad();
    gamepad.on('buttonReleased', async (buttonIndex) => {
        await nextTick();

        let currentFocussedElement = document.body.querySelector('*:focus');
        // Focus first element if focus is null
        if (!currentFocussedElement) {
            currentFocussedElement =
                document.body.querySelector(focusableElements);
        }

        switch (buttonIndex) {
            case Buttons.DPAD_UP:
                moveFocus(currentFocussedElement, 'up');
                break;
            case Buttons.DPAD_DOWN:
                moveFocus(currentFocussedElement, 'down');
                break;
            case Buttons.DPAD_LEFT:
                moveFocus(currentFocussedElement, 'left');
                break;
            case Buttons.DPAD_RIGHT:
                moveFocus(currentFocussedElement, 'right');
                break;
        }
    });

    /**
     * Focusses the closest element in a direction
     *
     * @param currentElement
     * @param direction
     */
    const moveFocus = (currentElement, direction) => {
        const allFocussableElements = Array.from(
            document.body.querySelectorAll(focusableElements),
        ).filter((el) => {
            return !!(
                el.offsetWidth ||
                el.offsetHeight ||
                el.getClientRects().length
            );
        });

        let closest;
        let closestDistance = Infinity;
        const currentRect = currentElement.getBoundingClientRect();

        allFocussableElements.forEach((el) => {
            if (el === currentElement) return;
            let elRect = el.getBoundingClientRect();

            // exclude elements outside of direction of focus
            if (
                (direction === 'up' && elRect.bottom > currentRect.top) ||
                (direction === 'down' && elRect.top < currentRect.bottom) ||
                (direction === 'left' && elRect.right > currentRect.left) ||
                (direction === 'right' && elRect.left < currentRect.right)
            ) {
                return;
            }

            let distance;

            switch (direction) {
                case 'up':
                    distance = currentRect.top - elRect.bottom;
                    break;
                case 'down':
                    distance = elRect.top - currentRect.bottom;
                    break;
                case 'left':
                    distance = currentRect.left - elRect.right;
                    break;
                case 'right':
                    distance = elRect.left - currentRect.right;
                    break;
            }

            if (distance < closestDistance) {
                closest = el;
                closestDistance = distance;
            }
        });

        if (closest) {
            currentElement.blur();
            closest.focus();

            const audio = useInterfaceAudio(InterfaceSounds.BUMP);
            audio.playAudio();
        }
    };
}
</script>

<style lang="scss">
#app {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    overflow: hidden;

    & > main {
        overflow-y: scroll;
    }
}
</style>

<style lang="scss" v-if="window.spinshare.settings.IsConsole">
:root {
    font-size: 18px;
}
#app {
    height: calc(100% - 60px);
}
</style>
