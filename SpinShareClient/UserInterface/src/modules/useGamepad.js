import mitt from 'mitt';
import { onMounted, onUnmounted, ref } from 'vue';

export const focusableElements =
    'button:not([tabindex="-1"]):not([disabled]), [href]:not([tabindex="-1"]):not([hidden]), input:not([tabindex="-1"]):not([disabled]), select:not([tabindex="-1"]):not([disabled]), textarea:not([tabindex="-1"]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([hidden])';

/**
 * Button Mapping for Xbox Controllers
 * @type {Readonly<{A: number, B: number, RIGHT_BUMPER: number, LEFT_STICK: number, RIGHT_TRIGGER: number, VIEW: number, RIGHT_STICK: number, LEFT_BUMPER: number, DPAD_UP: number, DPAD_DOWN: number, DPAD_RIGHT: number, X: number, Y: number, LEFT_TRIGGER: number, XBOX: number, MENU: number, DPAD_LEFT: number}>}
 */
export const Buttons = Object.freeze({
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LEFT_BUMPER: 4,
    RIGHT_BUMPER: 5,
    LEFT_TRIGGER: 6,
    RIGHT_TRIGGER: 7,
    VIEW: 8,
    MENU: 9,
    LEFT_STICK: 10,
    RIGHT_STICK: 11,
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15,
    XBOX: 16,
});

/**
 * Returns a string based on a button index
 *
 * @param index
 * @returns {string}
 */
export const buttonIndexToString = (index) => {
    return Object.keys(Buttons).find((key) => Buttons[key] === index);
};

/**
 * Monitors the state of a gamepad and emits events when buttons are pressed or released.
 * @returns {EventEmitter} The event emitter object.
 */
export default function useGamepad() {
    const emitter = mitt();
    let animationFrameId = null;
    let gamepad = null;
    const isPressed = ref([]);
    const pressTime = new Array(17).fill(0); // for holding press time of each button
    const holdInterval = 0.2; // duration for button hold event timer in seconds

    const pollGamepad = () => {
        gamepad = navigator.getGamepads()[0];
        if (gamepad) {
            let currentTime = performance.now(); // fetch current time

            for (let i = 0; i < gamepad.buttons.length; i++) {
                isPressed[i] = isPressed[i] || false;

                const button = gamepad.buttons[i];

                if (button.pressed && !isPressed[i]) {
                    emitter.emit('buttonPressed', i);
                    isPressed[i] = true;
                    pressTime[i] = currentTime; // store button press time
                }

                if (
                    button.pressed &&
                    isPressed[i] &&
                    currentTime - pressTime[i] > 500 &&
                    (currentTime - pressTime[i]) % (holdInterval * 1000) < 10
                ) {
                    // the button has been held down for longer than declared holdInterval
                    // fire 'buttonReleased' event every 'holdInterval' seconds
                    emitter.emit('buttonReleased', i);
                }

                if (!button.pressed && isPressed[i]) {
                    emitter.emit('buttonReleased', i);
                    isPressed[i] = false;
                    pressTime[i] = 0; // reset button press time
                }
            }
        }
        animationFrameId = requestAnimationFrame(pollGamepad);
    };

    onMounted(() => {
        if ('getGamepads' in navigator) {
            pollGamepad();
        }
    });

    onUnmounted(() => {
        cancelAnimationFrame(animationFrameId);
    });

    return emitter;
}
