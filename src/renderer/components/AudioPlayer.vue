<template>
    <div
        class="audio-player"
        v-if="currentChart"
    >
        <div class="player-content">
            <div class="track-info">
                <div
                    class="cover"
                    :style="`background-image: url('${currentChart.cover}')`"
                ></div>
                <div class="details">
                    <div class="title">{{ currentChart.title }}</div>
                    <div class="artist">{{ currentChart.artist }}</div>
                </div>
            </div>

            <div class="controls">
                <button
                    class="control-btn"
                    @click="playPrevious"
                    v-interactable
                    title="Previous track (Shift+←)"
                    :disabled="!playlist || playlist.length <= 1"
                >
                    <Remixicon icon="skip-back" filled />
                </button>
                <button
                    class="control-btn"
                    @click="skipBackward()"
                    v-interactable
                    title="Rewind 5s (←)"
                >
                    <Remixicon icon="rewind" />
                </button>
                <button
                    class="control-btn play-pause"
                    @click="togglePlayPause"
                    v-interactable
                    :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
                >
                    <Remixicon
                        v-if="isPlaying"
                        icon="pause"
                        filled
                    />
                    <Remixicon
                        v-else
                        icon="play"
                        filled
                    />
                </button>
                <button
                    class="control-btn"
                    @click="skipForward()"
                    v-interactable
                    title="Fast forward 5s (→)"
                >
                    <Remixicon icon="speed" />
                </button>
                <button
                    class="control-btn"
                    @click="playNext"
                    v-interactable
                    title="Next track (Shift+→)"
                    :disabled="!playlist || playlist.length <= 1"
                >
                    <Remixicon icon="skip-forward" filled />
                </button>
            </div>

            <div class="progress-container">
                <span class="time">{{ formattedCurrentTime }}</span>
                <div
                    class="progress-bar"
                    @click="handleProgressClick"
                    @mousedown="handleProgressMouseDown"
                    ref="progressBar"
                >
                    <div
                        class="progress-fill"
                        :style="{ width: `${progress}%` }"
                    >
                        <div class="progress-handle"></div>
                    </div>
                </div>
                <span class="time">{{ formattedDuration }}</span>
            </div>

            <div class="volume-container">
                <button
                    class="control-btn"
                    @click="toggleMute"
                    v-interactable
                    :title="isMuted ? 'Unmute (M)' : 'Mute (M)'"
                >
                    <Remixicon
                        v-if="isMuted || volume === 0"
                        icon="volume-mute"
                    />
                    <Remixicon
                        v-else-if="volume < 0.5"
                        icon="volume-down"
                    />
                    <Remixicon
                        v-else
                        icon="volume-up"
                    />
                </button>
                <div
                    class="volume-slider"
                    @click="handleVolumeClick"
                    @mousedown="handleVolumeMouseDown"
                    ref="volumeSlider"
                >
                    <div
                        class="volume-fill"
                        :style="{ width: `${volume * 100}%` }"
                    ></div>
                </div>
            </div>

            <button
                class="close-btn"
                @click="stop"
                v-interactable
                title="Close player (Esc)"
            >
                <Remixicon icon="close" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import Remixicon from '@/components/Remixicon.vue';

const {
    currentChart,
    playlist,
    isPlaying,
    progress,
    formattedCurrentTime,
    formattedDuration,
    volume,
    togglePlayPause,
    stop,
    skipForward,
    skipBackward,
    playNext,
    playPrevious,
    seekByPercentage,
    setVolume,
} = useAudioPlayer();

const progressBar = ref(null);
const volumeSlider = ref(null);
const isMuted = ref(false);
const volumeBeforeMute = ref(0.5);

function handleProgressClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    seekByPercentage(percentage);
}

let isDragging = false;

function handleProgressMouseDown(event) {
    isDragging = true;
    handleProgressDrag(event);

    function handleProgressDrag(e) {
        if (!isDragging) return;
        const rect = progressBar.value.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        seekByPercentage(percentage);
    }

    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleProgressDrag);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleProgressDrag);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleVolumeClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    setVolume(Math.max(0, Math.min(1, percentage)));
    if (isMuted.value && percentage > 0) {
        isMuted.value = false;
    }
}

let isVolumeDragging = false;

function handleVolumeMouseDown(event) {
    isVolumeDragging = true;
    handleVolumeDrag(event);

    function handleVolumeDrag(e) {
        if (!isVolumeDragging) return;
        const rect = volumeSlider.value.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        setVolume(Math.max(0, Math.min(1, percentage)));
        if (isMuted.value && percentage > 0) {
            isMuted.value = false;
        }
    }

    function handleMouseUp() {
        isVolumeDragging = false;
        document.removeEventListener('mousemove', handleVolumeDrag);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleVolumeDrag);
    document.addEventListener('mouseup', handleMouseUp);
}

function toggleMute() {
    if (isMuted.value) {
        isMuted.value = false;
        setVolume(volumeBeforeMute.value);
    } else {
        isMuted.value = true;
        volumeBeforeMute.value = volume.value;
        setVolume(0);
    }
}

function handleKeyDown(event) {
    // Only handle if we have a chart loaded
    if (!currentChart.value) return;

    // Don't handle if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    switch (event.key) {
        case ' ':
        case 'k':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            if (event.shiftKey) {
                playPrevious();
            } else {
                skipBackward();
            }
            break;
        case 'ArrowRight':
            event.preventDefault();
            if (event.shiftKey) {
                playNext();
            } else {
                skipForward();
            }
            break;
        case 'ArrowUp':
            event.preventDefault();
            setVolume(Math.min(1, volume.value + 0.1));
            if (isMuted.value) isMuted.value = false;
            break;
        case 'ArrowDown':
            event.preventDefault();
            setVolume(Math.max(0, volume.value - 0.1));
            break;
        case 'm':
            event.preventDefault();
            toggleMute();
            break;
        case 'Escape':
            event.preventDefault();
            stop();
            break;
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

</script>

<style scoped>
.audio-player {
    @apply bg-base-100 dark:bg-base-900 border-t border-base-300 dark:border-base-800;
    /* Position in grid - span column 2 (main content area) and row 3 (bottom) */
    grid-column: 2;
    grid-row: 3;
    z-index: 50;
}

.player-content {
    @apply flex items-center gap-4 px-4 py-3;
}

.track-info {
    @apply flex items-center gap-3 min-w-0 flex-shrink-0;
    width: 250px;
}

.cover {
    @apply w-12 h-12 rounded bg-center bg-cover flex-shrink-0;
}

.details {
    @apply min-w-0 flex-1;
}

.title {
    @apply font-medium text-sm truncate;
}

.artist {
    @apply text-xs text-base-500 dark:text-base-400 truncate;
}

.controls {
    @apply flex items-center gap-2 flex-shrink-0;
}

.control-btn {
    @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-200 dark:hover:bg-base-800 transition-colors;

    &:disabled {
        @apply opacity-30 cursor-not-allowed;

        &:hover {
            @apply bg-transparent dark:bg-transparent;
        }
    }
}

.control-btn.play-pause {
    @apply w-10 h-10 bg-base-200 dark:bg-base-800 hover:bg-base-300 dark:hover:bg-base-700;
}

.progress-container {
    @apply flex items-center gap-2 flex-1 min-w-0;
}

.time {
    @apply text-xs text-base-500 dark:text-base-400 tabular-nums flex-shrink-0;
}

.progress-bar {
    @apply flex-1 h-1 bg-base-200 dark:bg-base-800 rounded-full cursor-pointer relative;
}

.progress-fill {
    @apply h-full bg-brand-500 rounded-full relative transition-all;
}

.progress-handle {
    @apply absolute w-3 h-3 bg-brand-500 rounded-full opacity-0 transition-opacity;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
}

.progress-bar:hover .progress-handle {
    @apply opacity-100;
}

.progress-bar:hover .progress-fill {
    @apply h-1.5;
}

.volume-container {
    @apply flex items-center gap-2 flex-shrink-0;
    width: 120px;
}

.volume-slider {
    @apply flex-1 h-1 bg-base-200 dark:bg-base-800 rounded-full cursor-pointer relative;
}

.volume-fill {
    @apply h-full bg-base-500 dark:bg-base-400 rounded-full transition-all;
}

.volume-slider:hover .volume-fill {
    @apply h-1.5;
}

.close-btn {
    @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-200 dark:hover:bg-base-800 transition-colors flex-shrink-0;
}
</style>
