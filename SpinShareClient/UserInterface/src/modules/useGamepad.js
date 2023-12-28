import mitt from 'mitt';
import { onMounted, onUnmounted, ref } from 'vue';

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

    const isPressed = ref([]); // an array of boolean indicating whether each button is pressed

    const pollGamepad = () => {
        gamepad = navigator.getGamepads()[0];
        if (gamepad) {
            for (let i = 0; i < gamepad.buttons.length; i++) {
                isPressed[i] = isPressed[i] || false; // if undefined, initialize to false

                const button = gamepad.buttons[i];
                if (button.pressed && !isPressed[i]) {
                    // the button is pressed and it was not pressed before: emit buttonPressed event
                    emitter.emit('buttonPressed', i);
                    isPressed[i] = true;
                } else if (!button.pressed && isPressed[i]) {
                    // the button is not pressed and it was pressed before: emit buttonReleased event
                    emitter.emit('buttonReleased', i);
                    isPressed[i] = false;
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
