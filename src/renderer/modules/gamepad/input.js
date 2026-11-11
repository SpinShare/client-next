import { gamepadState } from '@/modules/gamepad/state';

/*
 * Turns raw controller state into navigation actions
 *
 * Sources:
 * - web:    Chromium's Gamepad API
 * - native: evdev reader in the main process (Linux fallback, SteamDeck)
 */

export const BUTTON = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    SELECT: 8,
    START: 9,
    LS: 10,
    RS: 11,
    UP: 12,
    DOWN: 13,
    LEFT: 14,
    RIGHT: 15,
    HOME: 16,
};

const BUTTON_ACTIONS = {
    [BUTTON.A]: 'accept',
    [BUTTON.B]: 'back',
    [BUTTON.X]: 'secondary',
    [BUTTON.Y]: 'search',
    [BUTTON.LB]: 'prevTab',
    [BUTTON.RB]: 'nextTab',
    [BUTTON.LT]: 'prevPage',
    [BUTTON.RT]: 'nextPage',
    [BUTTON.SELECT]: 'downloads',
    [BUTTON.START]: 'menu',
};

const DIRECTIONS = ['up', 'down', 'left', 'right'];
const STICK_THRESHOLD = 0.55;
const STICK_DEADZONE = 0.2;
const REPEAT_DELAY_MS = 380;
const REPEAT_INTERVAL_MS = 95;

function emptyState() {
    return { buttons: new Array(17).fill(false), axes: [0, 0, 0, 0] };
}

function directionsFromState(state) {
    const [lx, ly] = state.axes;
    return {
        up: state.buttons[BUTTON.UP] || ly < -STICK_THRESHOLD,
        down: state.buttons[BUTTON.DOWN] || ly > STICK_THRESHOLD,
        left: state.buttons[BUTTON.LEFT] || lx < -STICK_THRESHOLD,
        right: state.buttons[BUTTON.RIGHT] || lx > STICK_THRESHOLD,
    };
}

function isActive(state) {
    return state.buttons.some(Boolean) || state.axes.some((value) => Math.abs(value) > STICK_DEADZONE);
}

function glyphStyleFromId(id) {
    return /054c|playstation|dualshock|dualsense|wireless controller/i.test(id) ? 'playstation' : 'xbox';
}

class SourceTracker {
    constructor(name) {
        this.name = name;
        this.state = emptyState();
        this.previous = emptyState();
        this.previousDirections = { up: false, down: false, left: false, right: false };
        this.repeat = {};
    }
}

export class GamepadInput {
    /**
     * @param {(action: string, info: { source: string, repeat: boolean }) => void} onAction
     * @param {(dx: number, dy: number) => void} onScroll Right stick scrolling, values -1..1 per frame
     */
    constructor(onAction, onScroll) {
        this.onAction = onAction;
        this.onScroll = onScroll;
        this.sources = { web: new SourceTracker('web'), native: new SourceTracker('native') };
        this.activeSource = null;
        this.running = false;
        this.frame = null;
        this.removeNativeListener = null;
        this.webGamepads = [];
        this.windowFocused = document.hasFocus();

        this.loop = this.loop.bind(this);
        this.handleGamepadConnected = this.handleGamepadConnected.bind(this);
        this.handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
    }

    start() {
        if (this.running) return;
        this.running = true;

        window.addEventListener('gamepadconnected', this.handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        window.addEventListener('blur', this.handleBlur);
        window.addEventListener('focus', this.handleFocus);

        const gamepadApi = window.spshGamepad;
        if (gamepadApi && gamepadState.platform.nativeGamepadSupported) {
            this.removeNativeListener = gamepadApi.onNativeState((state) => {
                if (!this.windowFocused) return;
                this.sources.native.state = state;
                gamepadState.glyphStyle = 'xbox';
            });
            gamepadApi.startNative();
        }

        this.frame = requestAnimationFrame(this.loop);
    }

    stop() {
        if (!this.running) return;
        this.running = false;

        window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('focus', this.handleFocus);

        if (this.removeNativeListener) {
            this.removeNativeListener();
            this.removeNativeListener = null;
            window.spshGamepad.stopNative();
        }
        cancelAnimationFrame(this.frame);
        this.resetSources();
    }

    resetSources() {
        for (const source of Object.values(this.sources)) {
            source.state = emptyState();
            source.repeat = {};
        }
        this.activeSource = null;
    }

    handleGamepadConnected(event) {
        console.log(`[Gamepad] Connected (Gamepad API): ${event.gamepad.id} (mapping: ${event.gamepad.mapping || 'none'})`);
    }

    handleGamepadDisconnected(event) {
        console.log(`[Gamepad] Disconnected (Gamepad API): ${event.gamepad.id}`);
    }

    handleBlur() {
        this.windowFocused = false;
        this.resetSources();
    }

    handleFocus() {
        this.windowFocused = true;
    }

    readWebGamepads() {
        const merged = emptyState();
        let gamepads;
        try {
            gamepads = [...(navigator.getGamepads?.() ?? [])].filter((gamepad) => gamepad && gamepad.connected);
        } catch {
            gamepads = [];
        }
        this.webGamepads = gamepads;

        for (const gamepad of gamepads) {
            gamepad.buttons.forEach((button, index) => {
                if (index < merged.buttons.length && (button.pressed || button.value > 0.5)) merged.buttons[index] = true;
            });
            gamepad.axes.slice(0, 4).forEach((value, index) => {
                if (Math.abs(value) > Math.abs(merged.axes[index])) merged.axes[index] = value;
            });
        }

        if (gamepads.length && isActive(merged)) {
            const activePad = gamepads.find((gamepad) => gamepad.buttons.some((button) => button.pressed)) ?? gamepads[0];
            gamepadState.glyphStyle = glyphStyleFromId(activePad.id);
        }

        return merged;
    }

    loop(now) {
        if (!this.running) return;
        this.frame = requestAnimationFrame(this.loop);
        if (!this.windowFocused) return;

        this.sources.web.state = this.readWebGamepads();

        // Pick the source we listen to
        const active = this.activeSource ? this.sources[this.activeSource] : null;
        if (!active || !isActive(active.state)) {
            const candidate = Object.values(this.sources).find((source) => isActive(source.state));
            if (candidate) this.activeSource = candidate.name;
        }

        for (const source of Object.values(this.sources)) {
            const emit = source.name === this.activeSource;
            this.processSource(source, now, emit);
        }
    }

    processSource(source, now, emit) {
        const { state, previous } = source;

        // Buttons
        for (const [index, action] of Object.entries(BUTTON_ACTIONS)) {
            if (state.buttons[index] && !previous.buttons[index] && emit) {
                this.emitAction(action, source.name, false);
            }
        }

        // Directions
        const directions = directionsFromState(state);
        for (const direction of DIRECTIONS) {
            const pressed = directions[direction];
            const wasPressed = source.previousDirections[direction];
            if (pressed && !wasPressed) {
                source.repeat[direction] = now + REPEAT_DELAY_MS;
                if (emit) this.emitAction(direction, source.name, false);
            } else if (pressed && wasPressed && now >= (source.repeat[direction] ?? Infinity)) {
                source.repeat[direction] = now + REPEAT_INTERVAL_MS;
                if (emit) this.emitAction(direction, source.name, true);
            } else if (!pressed) {
                delete source.repeat[direction];
            }
        }

        // Right stick scrolling
        if (emit) {
            const [, , rx, ry] = state.axes;
            const dx = Math.abs(rx) > STICK_DEADZONE ? rx : 0;
            const dy = Math.abs(ry) > STICK_DEADZONE ? ry : 0;
            if (dx || dy) this.onScroll(dx, dy);
        }

        source.previous = { buttons: [...state.buttons], axes: [...state.axes] };
        source.previousDirections = directions;
    }

    emitAction(action, source, repeat) {
        gamepadState.lastSource = source;
        gamepadState.lastAction = action;
        this.onAction(action, { source, repeat });
    }

    getDiagnostics() {
        return {
            activeSource: this.activeSource,
            webGamepads: this.webGamepads.map((gamepad) => ({
                index: gamepad.index,
                id: gamepad.id,
                mapping: gamepad.mapping || 'none',
                buttons: gamepad.buttons.length,
                axes: gamepad.axes.length,
            })),
        };
    }
}
