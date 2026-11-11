<template>
    <span
        :class="['button-glyph', `glyph-${glyph.shape}`, `glyph-${button.toLowerCase()}`, `style-${gamepadState.glyphStyle}`]"
        :aria-label="glyph.label"
    >
        <Remixicon
            v-if="glyph.icon"
            :icon="glyph.icon"
            size="sm"
        />
        <template v-else>{{ glyph.label }}</template>
    </span>
</template>

<script setup>
import { computed } from 'vue';
import Remixicon from '@/components/Remixicon.vue';
import { gamepadState } from '@/modules/gamepad/state';

const props = defineProps({
    // A, B, X, Y, LB, RB, LT, RT, START, SELECT, DPAD, RS
    button: {
        type: String,
        required: true,
    },
});

const PLAYSTATION = { A: '✕', B: '○', X: '□', Y: '△', LB: 'L1', RB: 'R1', LT: 'L2', RT: 'R2' };
const KEYBOARD = { A: 'Enter', B: 'Esc', LB: 'Q', RB: 'E', LT: 'PgUp', RT: 'PgDn', START: 'M', DPAD: '↑↓←→' };

const glyph = computed(() => {
    const button = props.button.toUpperCase();
    const style = gamepadState.glyphStyle;

    if (style === 'keyboard' && KEYBOARD[button]) return { shape: 'key', label: KEYBOARD[button] };

    switch (button) {
        case 'START':
            return { shape: 'round', icon: 'menu', label: 'Menu' };
        case 'SELECT':
            return { shape: 'round', icon: 'checkbox-multiple-blank', label: 'View' };
        case 'DPAD':
            return { shape: 'round', icon: 'gamepad', label: 'D-Pad' };
        case 'RS':
            return { shape: 'round', label: 'R' };
        case 'LB':
        case 'RB':
        case 'LT':
        case 'RT':
            return { shape: 'shoulder', label: style === 'playstation' ? PLAYSTATION[button] : button };
        default:
            return { shape: 'face', label: style === 'playstation' ? PLAYSTATION[button] : button };
    }
});
</script>

<style scoped>
.button-glyph {
    @apply inline-flex items-center justify-center shrink-0 font-bold leading-none select-none;
    @apply bg-base-800 text-base-50 dark:bg-base-100 dark:text-base-950;
    font-size: 0.8rem;

    &.glyph-face,
    &.glyph-round {
        @apply w-[1.6rem] h-[1.6rem] rounded-full;
    }
    &.glyph-shoulder {
        @apply h-[1.4rem] px-2 rounded-md;
        font-size: 0.7rem;
    }
    &.glyph-key {
        @apply h-[1.5rem] px-2 rounded;
        font-size: 0.7rem;
    }

    /* Xbox / Steam Deck face button colors */
    &.style-xbox {
        &.glyph-a {
            @apply bg-green-600 text-white;
        }
        &.glyph-b {
            @apply bg-red-600 text-white;
        }
        &.glyph-x {
            @apply bg-blue-600 text-white;
        }
        &.glyph-y {
            @apply bg-amber-500 text-amber-950;
        }
    }
}
</style>
