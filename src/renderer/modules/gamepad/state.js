import { computed, reactive, watch } from 'vue';

/*
 * Shared state of the gamepad / Big Picture UI
 */
export const gamepadState = reactive({
    setting: 'auto',
    platform: {
        platform: '',
        forceBigPicture: false,
        isSteamOS: false,
        isGamescope: false,
        isSteamDeck: false,
        isLaunchedBySteam: false,
        nativeGamepadSupported: false,
    },
    inputMode: 'pointer',
    // 'xbox' | 'playstation' | 'keyboard'
    glyphStyle: 'xbox',
    lastSource: null,
    lastAction: null,
    focusedHints: {},
    pageHasPagination: false,
    isEditingText: false,
    pickerRequest: null,
    sidebarOpen: false,
    downloadsOpen: false,
    accountOpen: false,
});

export const isBigPicture = computed(() => {
    if (gamepadState.platform.forceBigPicture) return true;
    if (gamepadState.setting === 'on') return true;
    if (gamepadState.setting === 'off') return false;
    return gamepadState.platform.isSteamOS || gamepadState.platform.isGamescope || gamepadState.platform.isSteamDeck;
});

/** The UI is designed for a 1280px wide viewport (Steam Deck) and scaled up uniformly on larger screens */
const DESIGN_WIDTH = 1280;
let appliedZoom = null;

function applyZoom() {
    const gamepadApi = window.spshGamepad;
    if (!gamepadApi) return;

    if (!isBigPicture.value) {
        if (appliedZoom !== null) {
            gamepadApi.setZoomFactor(1);
            appliedZoom = null;
        }
        return;
    }

    const currentZoom = gamepadApi.getZoomFactor() || 1;
    const physicalWidth = window.innerWidth * currentZoom;
    const zoom = Math.round(Math.min(3, Math.max(1, physicalWidth / DESIGN_WIDTH)) * 100) / 100;
    if (zoom !== appliedZoom) {
        gamepadApi.setZoomFactor(zoom);
        appliedZoom = zoom;
    }
}

export async function initGamepadState(settingsManager) {
    try {
        gamepadState.platform = await window.spshGamepad.getPlatform();
    } catch (error) {
        console.error('[Gamepad] Could not get platform info', error);
    }
    gamepadState.setting = (await settingsManager.get('gamepadUi')) || 'auto';

    watch(
        isBigPicture,
        (enabled) => {
            document.documentElement.classList.toggle('big-picture', enabled);
            if (!enabled) {
                setInputMode('pointer');
                gamepadState.sidebarOpen = false;
                gamepadState.accountOpen = false;
            }
            applyZoom();
        },
        { immediate: true },
    );

    let resizeTimeout = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(applyZoom, 150);
    });
}

export function setInputMode(mode) {
    if (gamepadState.inputMode === mode) return;
    gamepadState.inputMode = mode;
    document.documentElement.classList.toggle('nav-gamepad', mode === 'gamepad');
}
