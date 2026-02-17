import { ref, computed } from 'vue';

// Shared state for the audio player
const currentChart = ref(null);
const playlist = ref([]);
const currentPlaylistIndex = ref(-1);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.5);

// Create a persistent Audio object at module scope so it survives component
// unmount/remount cycles (e.g. page navigation).
const audioElement = new Audio();
audioElement.volume = volume.value;

audioElement.addEventListener('timeupdate', () => {
    currentTime.value = audioElement.currentTime;
});
audioElement.addEventListener('loadedmetadata', () => {
    duration.value = audioElement.duration;
});
audioElement.addEventListener('durationchange', () => {
    if (audioElement.duration && !isNaN(audioElement.duration)) {
        duration.value = audioElement.duration;
    }
});
audioElement.addEventListener('ended', () => {
    // Inline stop logic to avoid referencing the function before it's defined
    audioElement.pause();
    audioElement.currentTime = 0;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    currentChart.value = null;
    playlist.value = [];
    currentPlaylistIndex.value = -1;
});

export function useAudioPlayer() {
    const progress = computed(() => {
        if (!duration.value || isNaN(duration.value)) return 0;
        return (currentTime.value / duration.value) * 100;
    });

    const formattedCurrentTime = computed(() => {
        return formatTime(currentTime.value);
    });

    const formattedDuration = computed(() => {
        return formatTime(duration.value);
    });

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function loadChart(chart, chartPlaylist = null, playlistIndex = -1) {
        // Reset audio without changing isPlaying state — using stop() would
        // briefly set isPlaying to false and trigger BGM to fade back in.
        audioElement.pause();
        audioElement.currentTime = 0;
        currentChart.value = chart;
        currentTime.value = 0;
        duration.value = 0;

        // If a playlist is provided, store it
        if (chartPlaylist && Array.isArray(chartPlaylist)) {
            playlist.value = chartPlaylist;
            currentPlaylistIndex.value = playlistIndex >= 0 ? playlistIndex : chartPlaylist.findIndex(c => c.id === chart.id);
        } else {
            // Single chart, no playlist
            playlist.value = [chart];
            currentPlaylistIndex.value = 0;
        }

        // Update the audio source
        if (chart) {
            const audioUrl = chart.paths?.ogg || `https://spinsha.re/uploads/audio/${chart.fileReference}.ogg`;
            audioElement.src = audioUrl;
            audioElement.load();
        }
    }

    async function playNext() {
        if (playlist.value.length === 0) return;

        const nextIndex = (currentPlaylistIndex.value + 1) % playlist.value.length;
        const nextChart = playlist.value[nextIndex];

        if (nextChart) {
            // If the chart doesn't have paths, we need to fetch it from API
            if (!nextChart.paths?.ogg && window.spshApi) {
                const fullChart = await window.spshApi.getChartDetail(nextChart.id);
                if (fullChart) {
                    loadChart(fullChart, playlist.value, nextIndex);
                    play();
                    return;
                }
            }

            loadChart(nextChart, playlist.value, nextIndex);
            play();
        }
    }

    async function playPrevious() {
        if (playlist.value.length === 0) return;

        const prevIndex = currentPlaylistIndex.value - 1 < 0 ? playlist.value.length - 1 : currentPlaylistIndex.value - 1;
        const prevChart = playlist.value[prevIndex];

        if (prevChart) {
            // If the chart doesn't have paths, we need to fetch it from API
            if (!prevChart.paths?.ogg && window.spshApi) {
                const fullChart = await window.spshApi.getChartDetail(prevChart.id);
                if (fullChart) {
                    loadChart(fullChart, playlist.value, prevIndex);
                    play();
                    return;
                }
            }

            loadChart(prevChart, playlist.value, prevIndex);
            play();
        }
    }

    function play() {
        if (currentChart.value) {
            audioElement.volume = volume.value;
            audioElement.play();
            isPlaying.value = true;
        }
    }

    function pause() {
        audioElement.pause();
        isPlaying.value = false;
    }

    function stop() {
        audioElement.pause();
        audioElement.currentTime = 0;
        isPlaying.value = false;
        currentTime.value = 0;
        duration.value = 0;
        currentChart.value = null;
        playlist.value = [];
        currentPlaylistIndex.value = -1;
    }

    function togglePlayPause() {
        if (isPlaying.value) {
            pause();
        } else {
            play();
        }
    }

    function seek(timeInSeconds) {
        audioElement.currentTime = timeInSeconds;
        currentTime.value = timeInSeconds;
    }

    function seekByPercentage(percentage) {
        // Get duration directly from the audio element
        const actualDuration = audioElement.duration;

        if (actualDuration && !isNaN(actualDuration)) {
            const newTime = (percentage / 100) * actualDuration;
            seek(newTime);
        } else {
            console.error('Cannot seek - duration not available yet');
        }
    }

    function skipForward(seconds = 5) {
        // Get current time directly from the audio element
        const current = audioElement.currentTime;

        // Validate current time
        if (current === undefined || current === null || isNaN(current)) {
            console.error('Cannot skip forward - invalid current time:', current);
            return;
        }

        // Try to get duration from multiple sources
        let dur = duration.value;
        if (!dur || isNaN(dur)) {
            dur = audioElement.duration;
        }

        if (!dur || isNaN(dur) || dur === 0) {
            console.error('Cannot skip forward - invalid duration');
            return;
        }

        // Validate seconds parameter
        if (isNaN(seconds)) {
            console.error('Cannot skip forward - invalid seconds:', seconds);
            return;
        }

        const newTime = Math.min(current + seconds, dur);

        if (isNaN(newTime)) {
            console.error('Calculated newTime is NaN! current:', current, 'seconds:', seconds, 'dur:', dur);
            return;
        }

        seek(newTime);
    }

    function skipBackward(seconds = 5) {
        // Get current time directly from the audio element
        const current = audioElement.currentTime;

        // Validate current time
        if (current === undefined || current === null || isNaN(current)) {
            console.error('Cannot skip backward - invalid current time:', current);
            return;
        }

        // Validate seconds parameter
        if (isNaN(seconds)) {
            console.error('Cannot skip backward - invalid seconds:', seconds);
            return;
        }

        const newTime = Math.max(current - seconds, 0);

        if (isNaN(newTime)) {
            console.error('Calculated newTime is NaN! current:', current, 'seconds:', seconds);
            return;
        }

        seek(newTime);
    }

    function setVolume(newVolume) {
        volume.value = Math.max(0, Math.min(1, newVolume));
        audioElement.volume = volume.value;
    }

    return {
        // State
        currentChart,
        playlist,
        currentPlaylistIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        progress,
        formattedCurrentTime,
        formattedDuration,

        // Methods
        loadChart,
        play,
        pause,
        stop,
        togglePlayPause,
        seek,
        seekByPercentage,
        skipForward,
        skipBackward,
        playNext,
        playPrevious,
        setVolume,
    };
}
