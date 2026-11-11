import { ipcMain, shell } from 'electron';
import fs from 'node:fs';
import { EventEmitter } from 'node:events';

/*
 * Gamepad support for the main process.
 * Since Chromium on Linux relies on legacy gamepad interfaces, we need to define our own.
 *
 * Output is the W3C Gamepad API state ({ buttons: bool[17], axes: number[4] }).
 */

// Linux input event types
const EV_KEY = 0x01;
const EV_ABS = 0x03;

// Linux key codes
const BTN_SOUTH = 0x130;
const BTN_EAST = 0x131;
const BTN_NORTH = 0x133; // BTN_X
const BTN_WEST = 0x134; // BTN_Y
const BTN_TL = 0x136;
const BTN_TR = 0x137;
const BTN_TL2 = 0x138;
const BTN_TR2 = 0x139;
const BTN_SELECT = 0x13a;
const BTN_START = 0x13b;
const BTN_MODE = 0x13c;
const BTN_THUMBL = 0x13d;
const BTN_THUMBR = 0x13e;
const BTN_DPAD_UP = 0x220;
const BTN_DPAD_DOWN = 0x221;
const BTN_DPAD_LEFT = 0x222;
const BTN_DPAD_RIGHT = 0x223;

// Linux absolute axes
const ABS_X = 0x00;
const ABS_Y = 0x01;
const ABS_Z = 0x02;
const ABS_RX = 0x03;
const ABS_RY = 0x04;
const ABS_RZ = 0x05;
const ABS_HAT0X = 0x10;
const ABS_HAT0Y = 0x11;

// W3C gamepad button indices
const STD = {
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
const BUTTON_COUNT = 17;

// struct input_event is { struct timeval (2 longs), u16 type, u16 code, s32 value }
const IS_64_BIT = ['x64', 'arm64', 'ppc64', 's390x', 'riscv64', 'loong64'].includes(process.arch);
const EVENT_SIZE = IS_64_BIT ? 24 : 16;
const EVENT_TYPE_OFFSET = IS_64_BIT ? 16 : 8;

const POLL_INTERVAL_MS = 8;
const RESCAN_INTERVAL_MS = 3000;

/**
 * Parses a bitmap line from /proc/bus/input/devices (like "7cdb000000000000 0 0 0 0") into a bit checker.
 * 
 * @param {string} line
 * @returns {(bit: number) => boolean}
 */
function parseBitmap(line) {
    const wordBits = IS_64_BIT ? 64 : 32;
    const words = (line || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .reverse()
        .map((word) => BigInt(`0x${word}`));

    return (bit) => {
        const word = words[Math.floor(bit / wordBits)];
        if (word === undefined) return false;
        return ((word >> BigInt(bit % wordBits)) & 1n) === 1n;
    };
}

/**
 * Lists gamepad-like devices from /proc/bus/input/devices.
 * 
 * @returns {{ name: string, vendor: string, product: string, eventPath: string, hasDigitalTriggers: boolean }[]}
 */
function listGamepadDevices() {
    let content;
    try {
        content = fs.readFileSync('/proc/bus/input/devices', 'utf8');
    } catch {
        return [];
    }

    const devices = [];
    for (const block of content.split(/\n\s*\n/)) {
        const name = block.match(/^N: Name="(.*)"$/m)?.[1] ?? '';
        const vendor = block.match(/Vendor=([0-9a-f]+)/i)?.[1]?.toLowerCase() ?? '';
        const product = block.match(/Product=([0-9a-f]+)/i)?.[1]?.toLowerCase() ?? '';
        const handlers = block.match(/^H: Handlers=(.*)$/m)?.[1] ?? '';
        const keyBits = parseBitmap(block.match(/^B: KEY=(.*)$/m)?.[1]);
        const eventHandler = handlers.match(/\bevent\d+\b/)?.[0];

        // Gamepads have at least the "south" face button
        if (!eventHandler || !keyBits(BTN_SOUTH)) continue;

        devices.push({
            name,
            vendor,
            product,
            eventPath: `/dev/input/${eventHandler}`,
            hasDigitalTriggers: keyBits(BTN_TL2) && keyBits(BTN_TR2),
        });
    }
    return devices;
}

class EvdevGamepad {
    constructor(info) {
        this.info = info;
        this.fd = null;
        this.error = null;
        this.eventCount = 0;
        this.buffer = Buffer.alloc(EVENT_SIZE * 64);
        this.buttons = new Array(BUTTON_COUNT).fill(false);
        this.axes = [0, 0, 0, 0];
        this.hat = { x: 0, y: 0 };
        this.wideTriggers = false;

        // Xbox drivers report the left button (X) as BTN_X and the top button (Y) as BTN_Y.
        this.xboxFaceButtons = info.vendor === '045e' || /x-?box/i.test(info.name);

        try {
            this.fd = fs.openSync(info.eventPath, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK);
        } catch (error) {
            this.error = error.code || error.message;
        }
    }

    get isOpen() {
        return this.fd !== null;
    }

    /**
     * Reads all pending events. Returns true if the state changed.
     */
    poll() {
        if (this.fd === null) return false;
        let changed = false;

        for (;;) {
            let bytesRead;
            try {
                bytesRead = fs.readSync(this.fd, this.buffer, 0, this.buffer.length, null);
            } catch (error) {
                if (error.code === 'EAGAIN' || error.code === 'EWOULDBLOCK') break;
                // Device was unplugged or became unreadable
                this.error = error.code || error.message;
                this.close();
                return true;
            }
            if (!bytesRead) break;

            for (let offset = 0; offset + EVENT_SIZE <= bytesRead; offset += EVENT_SIZE) {
                const type = this.buffer.readUInt16LE(offset + EVENT_TYPE_OFFSET);
                const code = this.buffer.readUInt16LE(offset + EVENT_TYPE_OFFSET + 2);
                const value = this.buffer.readInt32LE(offset + EVENT_TYPE_OFFSET + 4);

                if (type === EV_KEY) {
                    changed = this.handleKey(code, value !== 0) || changed;
                    this.eventCount++;
                } else if (type === EV_ABS) {
                    changed = this.handleAbs(code, value) || changed;
                    this.eventCount++;
                }
            }

            if (bytesRead < this.buffer.length) break;
        }

        return changed;
    }

    setButton(index, pressed) {
        if (this.buttons[index] === pressed) return false;
        this.buttons[index] = pressed;
        return true;
    }

    handleKey(code, pressed) {
        switch (code) {
            case BTN_SOUTH:
                return this.setButton(STD.A, pressed);
            case BTN_EAST:
                return this.setButton(STD.B, pressed);
            case BTN_NORTH:
                return this.setButton(this.xboxFaceButtons ? STD.X : STD.Y, pressed);
            case BTN_WEST:
                return this.setButton(this.xboxFaceButtons ? STD.Y : STD.X, pressed);
            case BTN_TL:
                return this.setButton(STD.LB, pressed);
            case BTN_TR:
                return this.setButton(STD.RB, pressed);
            case BTN_TL2:
                return this.setButton(STD.LT, pressed);
            case BTN_TR2:
                return this.setButton(STD.RT, pressed);
            case BTN_SELECT:
                return this.setButton(STD.SELECT, pressed);
            case BTN_START:
                return this.setButton(STD.START, pressed);
            case BTN_MODE:
                return this.setButton(STD.HOME, pressed);
            case BTN_THUMBL:
                return this.setButton(STD.LS, pressed);
            case BTN_THUMBR:
                return this.setButton(STD.RS, pressed);
            case BTN_DPAD_UP:
                return this.setButton(STD.UP, pressed);
            case BTN_DPAD_DOWN:
                return this.setButton(STD.DOWN, pressed);
            case BTN_DPAD_LEFT:
                return this.setButton(STD.LEFT, pressed);
            case BTN_DPAD_RIGHT:
                return this.setButton(STD.RIGHT, pressed);
            default:
                return false;
        }
    }

    setAxis(index, value) {
        // Sticks are assumed to be signed 16 bit (xpad, Steam virtual gamepad, hid-steam)
        const normalized = Math.max(-1, Math.min(1, value / 32767));
        if (Math.abs(this.axes[index] - normalized) < 0.01) return false;
        this.axes[index] = normalized;
        return true;
    }

    handleAbs(code, value) {
        switch (code) {
            case ABS_X:
                return this.setAxis(0, value);
            case ABS_Y:
                return this.setAxis(1, value);
            case ABS_RX:
                return this.setAxis(2, value);
            case ABS_RY:
                return this.setAxis(3, value);
            case ABS_Z:
            case ABS_RZ: {
                // Devices with digital trigger buttons report those separately
                if (this.info.hasDigitalTriggers) return false;
                if (value > 255) this.wideTriggers = true;
                const threshold = this.wideTriggers ? 16384 : 128;
                return this.setButton(code === ABS_Z ? STD.LT : STD.RT, value > threshold);
            }
            case ABS_HAT0X: {
                const changedLeft = this.setButton(STD.LEFT, value < 0);
                const changedRight = this.setButton(STD.RIGHT, value > 0);
                return changedLeft || changedRight;
            }
            case ABS_HAT0Y: {
                const changedUp = this.setButton(STD.UP, value < 0);
                const changedDown = this.setButton(STD.DOWN, value > 0);
                return changedUp || changedDown;
            }
            default:
                return false;
        }
    }

    close() {
        if (this.fd !== null) {
            try {
                fs.closeSync(this.fd);
            } catch {
                // ignore
            }
        }
        this.fd = null;
        this.buttons.fill(false);
        this.axes = [0, 0, 0, 0];
    }
}

export class NativeGamepadReader extends EventEmitter {
    constructor() {
        super();
        this.devices = new Map();
        this.pollTimer = null;
        this.rescanTimer = null;
        this.lastStateJson = '';
    }

    get isSupported() {
        return process.platform === 'linux';
    }

    get isRunning() {
        return this.pollTimer !== null;
    }

    start() {
        if (!this.isSupported || this.isRunning) return;
        console.log('[Gamepad] Starting native evdev reader');

        this.rescan();
        this.rescanTimer = setInterval(() => this.rescan(), RESCAN_INTERVAL_MS);
        this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    }

    stop() {
        if (!this.isRunning) return;
        console.log('[Gamepad] Stopping native evdev reader');

        clearInterval(this.pollTimer);
        clearInterval(this.rescanTimer);
        this.pollTimer = null;
        this.rescanTimer = null;
        for (const device of this.devices.values()) device.close();
        this.devices.clear();
        this.lastStateJson = '';
    }

    rescan() {
        const found = listGamepadDevices();
        const foundPaths = new Set(found.map((info) => info.eventPath));

        for (const [eventPath, device] of this.devices) {
            if (!foundPaths.has(eventPath)) {
                console.log(`[Gamepad] Removed: ${device.info.name} (${eventPath})`);
                device.close();
                this.devices.delete(eventPath);
            }
        }

        for (const info of found) {
            const existing = this.devices.get(info.eventPath);
            // Retry devices that failed to open (permissions applied late by udev)
            if (existing && (existing.isOpen || existing.info.name !== info.name)) continue;
            if (existing) existing.close();

            const device = new EvdevGamepad(info);
            this.devices.set(info.eventPath, device);
            if (!existing) {
                console.log(`[Gamepad] Found: ${info.name} (${info.eventPath}, ${info.vendor}:${info.product})${device.error ? ` - ${device.error}` : ''}`);
            }
        }
    }

    poll() {
        let changed = false;
        for (const device of this.devices.values()) {
            changed = device.poll() || changed;
        }
        if (changed) this.emitState();
    }

    getState() {
        const buttons = new Array(BUTTON_COUNT).fill(false);
        const axes = [0, 0, 0, 0];

        for (const device of this.devices.values()) {
            if (!device.isOpen) continue;
            device.buttons.forEach((pressed, index) => {
                if (pressed) buttons[index] = true;
            });
            device.axes.forEach((value, index) => {
                if (Math.abs(value) > Math.abs(axes[index])) axes[index] = value;
            });
        }

        return { buttons, axes };
    }

    emitState() {
        const state = this.getState();
        const stateJson = JSON.stringify(state);
        if (stateJson === this.lastStateJson) return;
        this.lastStateJson = stateJson;
        this.emit('state', state);
    }

    getDiagnostics() {
        return [...this.devices.values()].map((device) => ({
            name: device.info.name,
            path: device.info.eventPath,
            id: `${device.info.vendor}:${device.info.product}`,
            open: device.isOpen,
            error: device.error,
            events: device.eventCount,
            pressed: device.buttons.map((pressed, index) => (pressed ? index : null)).filter((index) => index !== null),
        }));
    }
}

function readFileSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

/**
 * Detects whether the client is running on SteamOS / in gamescope (Steam's Gaming Mode) / on a Steam Deck
 */
export function getPlatformInfo() {
    const env = process.env;
    const isLinux = process.platform === 'linux';

    const osRelease = isLinux ? readFileSafe('/etc/os-release') : '';
    const osId = osRelease.match(/^ID=["']?([^"'\n]+)/m)?.[1] ?? '';
    const boardVendor = isLinux ? readFileSafe('/sys/devices/virtual/dmi/id/board_vendor').trim() : '';
    const productName = isLinux ? readFileSafe('/sys/devices/virtual/dmi/id/product_name').trim() : '';

    const isSteamOS = env.SteamOS === '1' || osId === 'steamos';
    const isGamescope = env.XDG_CURRENT_DESKTOP === 'gamescope' || !!env.GAMESCOPE_WAYLAND_DISPLAY || env.SteamGamepadUI === '1';
    const isSteamDeck = env.SteamDeck === '1' || (boardVendor === 'Valve' && ['Jupiter', 'Galileo'].includes(productName));
    const isLaunchedBySteam = !!(env.SteamAppId || env.SteamGameId || env.SteamClientLaunch) || isGamescope;

    return {
        platform: process.platform,
        // Launch option to always start in Big Picture mode
        forceBigPicture: process.argv.includes('--big-picture'),
        isSteamOS,
        isGamescope,
        isSteamDeck,
        isLaunchedBySteam,
        nativeGamepadSupported: isLinux,
    };
}

/**
 * @param {() => import('electron').BrowserWindow} getWindow
 */
export function setupGamepadHandlers(getWindow) {
    const reader = new NativeGamepadReader();
    const platformInfo = getPlatformInfo();
    console.log('[Gamepad] Platform:', JSON.stringify(platformInfo));

    reader.on('state', (state) => {
        const window = getWindow();
        // Never control the app while something else (e.g. the game) has focus
        if (!window || window.isDestroyed() || !window.isFocused()) return;
        window.webContents.send('gamepad-native-state', state);
    });

    ipcMain.handle('gamepad-get-platform', () => platformInfo);
    ipcMain.handle('gamepad-native-start', () => {
        reader.start();
        return reader.isRunning;
    });
    ipcMain.handle('gamepad-native-stop', () => {
        reader.stop();
    });
    ipcMain.handle('gamepad-get-diagnostics', () => ({
        platform: platformInfo,
        nativeRunning: reader.isRunning,
        nativeDevices: reader.getDiagnostics(),
    }));
    ipcMain.handle('open-steam-keyboard', async () => {
        try {
            await shell.openExternal('steam://open/keyboard');
            return true;
        } catch (error) {
            console.error('[Gamepad] Could not open Steam keyboard:', error);
            return false;
        }
    });

    return { reader, platformInfo };
}
