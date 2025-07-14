// modules/hoverDirective.js
import clickSound from '@/assets/audio/click.ogg?url';
import hoverSound from '@/assets/audio/hover.ogg?url';

export function createHoverDirective() {
    let audioHover;
    let audioClick;

    const createAudioHover = () => {
        if (!audioHover) {
            audioHover = new Audio(hoverSound);
            audioHover.volume = 0.25;

            audioHover.addEventListener('error', (e) => {
                console.error('Audio loading error:', e);
            });
        }
    };

    const createAudioClick = () => {
        if (!audioClick) {
            audioClick = new Audio(clickSound);
            audioClick.volume = 0.5;

            audioClick.addEventListener('error', (e) => {
                console.error('Audio loading error:', e);
            });
        }
    };

    const playHoverSound = async () => {
        if (!(await window.spshSettings.get('sfxEnabled'))) {
            return;
        }
        if (!audioHover) {
            createAudioHover();
        }

        try {
            audioHover.currentTime = 0;
            const playPromise = audioHover.play();

            playPromise.catch((error) => {
                console.error('Play failed:', error);
            });
        } catch (error) {
            console.error('Sound playback error:', error);
        }
    };

    const playClickSound = async () => {
        if (!(await window.spshSettings.get('sfxEnabled'))) {
            return;
        }
        if (!audioClick) {
            createAudioClick();
        }

        try {
            audioClick.currentTime = 0;
            const playPromise = audioClick.play();

            playPromise.catch((error) => {
                console.error('Play failed:', error);
            });
        } catch (error) {
            console.error('Sound playback error:', error);
        }
    };

    return {
        mounted(el) {
            createAudioHover();
            createAudioClick();
            el.addEventListener('mouseenter', playHoverSound);
            el.addEventListener('click', playClickSound);
        },
        unmounted(el) {
            el.removeEventListener('mouseenter', playHoverSound);
        },
    };
}
