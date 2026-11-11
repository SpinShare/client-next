<template>
    <pre class="gamepad-diagnostics">{{ report }}</pre>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { gamepadState, isBigPicture } from '@/modules/gamepad/state';

/*
 * Live overview to debug controllers
 */
const navigation = inject('navigation');
const report = ref('Loading...');
let interval = null;

async function update() {
    const main = await window.spshGamepad.getDiagnostics();
    const renderer = navigation.getDiagnostics();
    const { platform } = main;
    const webGamepads = [...(navigator.getGamepads?.() ?? [])].filter(Boolean);

    const lines = [];
    lines.push(`Platform:       ${platform.platform}`);
    lines.push(`SteamOS:        ${platform.isSteamOS}`);
    lines.push(`Gaming Mode:    ${platform.isGamescope}`);
    lines.push(`Steam Deck:     ${platform.isSteamDeck}`);
    lines.push(`Steam launch:   ${platform.isLaunchedBySteam}`);
    lines.push(`Setting:        ${gamepadState.setting} (Big Picture ${isBigPicture.value ? 'on' : 'off'})`);
    lines.push(`Window focused: ${renderer.windowFocused}`);
    lines.push('');
    lines.push(`Gamepad API (${webGamepads.length}):`);
    if (webGamepads.length === 0) lines.push('  none - press a button on the controller');
    for (const gamepad of webGamepads) {
        const pressed = gamepad.buttons.map((button, index) => (button.pressed ? index : null)).filter((index) => index !== null);
        lines.push(`  #${gamepad.index} ${gamepad.id} [mapping: ${gamepad.mapping || 'none'}, ${gamepad.buttons.length} buttons, ${gamepad.axes.length} axes, pressed: ${pressed.join(',') || '-'}]`);
    }
    lines.push('');
    if (platform.nativeGamepadSupported) {
        lines.push(`evdev reader (${main.nativeRunning ? 'running' : 'stopped'}, ${main.nativeDevices.length}):`);
        if (main.nativeDevices.length === 0) lines.push('  none');
        for (const device of main.nativeDevices) {
            const status = device.open ? `ok, ${device.events} events, pressed: ${device.pressed.join(',') || '-'}` : `error: ${device.error}`;
            lines.push(`  ${device.name} (${device.path}, ${device.id}) - ${status}`);
        }
        lines.push('');
    }
    lines.push(`Active source:  ${renderer.activeSource ?? '-'}`);
    lines.push(`Last input:     ${gamepadState.lastAction ?? '-'} (${gamepadState.lastSource ?? '-'})`);
    lines.push(`Input mode:     ${gamepadState.inputMode}, glyphs: ${gamepadState.glyphStyle}`);

    report.value = lines.join('\n');
}

let startedNative = false;

onMounted(async () => {
    // Also list evdev devices while Big Picture is off
    const main = await window.spshGamepad.getDiagnostics();
    if (main.platform.nativeGamepadSupported && !main.nativeRunning) {
        startedNative = await window.spshGamepad.startNative();
    }
    update();
    interval = setInterval(update, 500);
});

onUnmounted(() => {
    clearInterval(interval);
    if (startedNative && !isBigPicture.value) window.spshGamepad.stopNative();
});
</script>

<style scoped>
.gamepad-diagnostics {
    @apply text-xs leading-5 p-4 rounded-md bg-base-100 dark:bg-base-900 overflow-x-auto whitespace-pre-wrap break-all;
}
</style>
