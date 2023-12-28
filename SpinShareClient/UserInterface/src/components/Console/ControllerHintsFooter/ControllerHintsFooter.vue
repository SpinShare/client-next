<template>
    <div class="controller-hints-footer">
        <main>
            <ControllerHint
                v-if="showMenu"
                inputLabel="+"
                actionLabel="MENU"
            />
        </main>
        <aside>
            <ControllerHint
                v-for="(item, i) in items"
                :key="i"
                :inputLabel="buttonIndexToString(item.input)"
                :actionLabel="item.label"
                @click="item.onclick"
            />
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
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 25px;
    align-items: center;
    padding: 0 40px;

    & main {
        display: flex;
        gap: 15px;
    }
    & aside {
        display: flex;
        gap: 15px;
    }
}
</style>
<script setup>
import { inject, ref } from 'vue';
import ControllerHint from '@/components/Console/ControllerHintsFooter/ControllerHint.vue';
import useGamepad, { buttonIndexToString, Buttons } from '@/modules/useGamepad';
import useInterfaceAudio, {
    InterfaceSounds,
} from '@/modules/useInterfaceAudio';
import { useI18n } from 'vue-i18n';

const emitter = inject('emitter');
const { t } = useI18n();
const showMenu = ref(false);
const items = ref([]);

emitter.on('console-update-controller-hints', (hints) => {
    showMenu.value = !!hints.showMenu;
    items.value = hints.items;

    if (hints.showBack) {
        items.value.push({
            input: Buttons.B,
            label: t('general.back'),
            onclick: () => {
                history.back();
            },
        });
    }
});

emitter.on('console-add-controller-hint', (hint) => {
    // Don't add if ID already exists
    if (items.value.some((item) => item.id === hint.id)) return;
    items.value.unshift(hint);
});

emitter.on('console-remove-controller-hint', (hintId) => {
    items.value = items.value.filter((item) => item.id !== hintId);
});

const gamepad = useGamepad();
gamepad.on('buttonReleased', (buttonIndex) => {
    items.value.forEach((item) => {
        if (buttonIndex === item.input) {
            const audio = useInterfaceAudio(
                item.sound ?? InterfaceSounds.CLICK,
            );
            audio.playAudio();

            item.onclick();
        }
    });
});
</script>
