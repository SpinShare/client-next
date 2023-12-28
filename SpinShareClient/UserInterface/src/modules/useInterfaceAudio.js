import { ref } from 'vue';

export const InterfaceSounds = Object.freeze({
    BUMP: '/audio/bump.ogg',
    CLICK: '/audio/click.ogg',
    MOVE: '/audio/move.ogg',
    HERO: '/audio/hero.mp3',
    BIG_CLICK: '/audio/big-click.ogg',
});

export default function useInterfaceAudio(src) {
    const audio = ref(new Audio(src));

    const playAudio = () => {
        audio.value
            .play()
            .catch((error) =>
                console.error(`Failed to play the audio: ${error}`),
            );
    };

    return { playAudio };
}
