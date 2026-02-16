import { ref, computed } from 'vue';

// Shared state for the audio player
const audioElement = ref(null);
const currentChart = ref(null);
const playlist = ref([]);
const currentPlaylistIndex = ref(-1);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.5);

// Store event listener references so we can remove them properly
let timeUpdateHandler = null;
let loadedMetadataHandler = null;
let durationChangeHandler = null;
let endedHandler = null;

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

    function setAudioElement(element) {
        // Remove old event listeners if they exist
        if (audioElement.value) {
            if (timeUpdateHandler) audioElement.value.removeEventListener('timeupdate', timeUpdateHandler);
            if (loadedMetadataHandler) audioElement.value.removeEventListener('loadedmetadata', loadedMetadataHandler);
            if (durationChangeHandler) audioElement.value.removeEventListener('durationchange', durationChangeHandler);
            if (endedHandler) audioElement.value.removeEventListener('ended', endedHandler);
        }

        audioElement.value = element;

        if (element) {
            console.log('Setting up audio element listeners');

            // Create new event handlers
            timeUpdateHandler = () => {
                currentTime.value = element.currentTime;
                console.log('Time update:', element.currentTime);
            };
            loadedMetadataHandler = () => {
                duration.value = element.duration;
                console.log('Loaded metadata, duration:', element.duration);
            };
            durationChangeHandler = () => {
                if (element.duration && !isNaN(element.duration)) {
                    duration.value = element.duration;
                }
            };
            endedHandler = () => {
                console.log('Audio ended');
                stop();
            };

            // Add event listeners
            element.addEventListener('timeupdate', timeUpdateHandler);
            element.addEventListener('loadedmetadata', loadedMetadataHandler);
            element.addEventListener('durationchange', durationChangeHandler);
            element.addEventListener('ended', endedHandler);

            // Update duration immediately if metadata is already loaded
            if (element.duration && !isNaN(element.duration)) {
                duration.value = element.duration;
                console.log('Duration already available:', element.duration);
            }

            // Apply current volume to the new element
            element.volume = volume.value;

            // If a chart is already loaded, set its source now
            if (currentChart.value) {
                const audioUrl = currentChart.value.paths?.ogg || `https://spinsha.re/uploads/audio/${currentChart.value.fileReference}.ogg`;
                console.log('Setting audio source for already-loaded chart:', audioUrl);
                element.src = audioUrl;
            }
        }
    }

    function loadChart(chart, chartPlaylist = null, playlistIndex = -1) {
        // Reset audio without changing isPlaying state — using stop() would
        // briefly set isPlaying to false and trigger BGM to fade back in.
        if (audioElement.value) {
            audioElement.value.pause();
            audioElement.value.currentTime = 0;
        }
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

        // Update the audio source - this will be called again by setAudioElement if element isn't ready yet
        if (audioElement.value && chart) {
            const audioUrl = chart.paths?.ogg || `https://spinsha.re/uploads/audio/${chart.fileReference}.ogg`;
            console.log('Loading chart audio:', audioUrl);
            audioElement.value.src = audioUrl;
            audioElement.value.load();
        } else {
            console.log('Audio element not ready yet, will set source when available');
        }
    }

    async function playNext() {
        if (playlist.value.length === 0) return;

        const nextIndex = (currentPlaylistIndex.value + 1) % playlist.value.length;
        const nextChart = playlist.value[nextIndex];

        if (nextChart && audioElement.value) {
            // If the chart doesn't have paths, we need to fetch it from API
            if (!nextChart.paths?.ogg && window.spshApi) {
                console.log('Fetching full chart data for next track:', nextChart.id);
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

        if (prevChart && audioElement.value) {
            // If the chart doesn't have paths, we need to fetch it from API
            if (!prevChart.paths?.ogg && window.spshApi) {
                console.log('Fetching full chart data for previous track:', prevChart.id);
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
        if (audioElement.value && currentChart.value) {
            audioElement.value.volume = volume.value;
            audioElement.value.play();
            isPlaying.value = true;
        }
    }

    function pause() {
        if (audioElement.value) {
            audioElement.value.pause();
            isPlaying.value = false;
        }
    }

    function stop() {
        if (audioElement.value) {
            audioElement.value.pause();
            audioElement.value.currentTime = 0;
        }
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
        console.log('Seeking to:', timeInSeconds);
        if (audioElement.value) {
            audioElement.value.currentTime = timeInSeconds;
            currentTime.value = timeInSeconds;
        } else {
            console.error('No audio element available for seeking');
        }
    }

    function seekByPercentage(percentage) {
        if (audioElement.value) {
            // Get duration directly from the audio element
            const actualDuration = audioElement.value.duration;
            console.log('Seeking by percentage:', percentage, 'duration from element:', actualDuration, 'duration ref:', duration.value);

            if (actualDuration && !isNaN(actualDuration)) {
                const newTime = (percentage / 100) * actualDuration;
                seek(newTime);
            } else {
                console.error('Cannot seek - duration not available yet');
            }
        } else {
            console.error('Cannot seek - no audio element');
        }
    }

    function skipForward(seconds = 5) {
        if (!audioElement.value) {
            console.error('Cannot skip forward - no audio element');
            return;
        }

        // Get current time directly from the audio element
        const current = audioElement.value.currentTime;

        // Validate current time
        if (current === undefined || current === null || isNaN(current)) {
            console.error('Cannot skip forward - invalid current time:', current);
            return;
        }

        // Try to get duration from multiple sources
        let dur = duration.value;
        if (!dur || isNaN(dur)) {
            dur = audioElement.value.duration;
        }

        console.log('Skip forward - current:', current, 'duration.value:', duration.value, 'element.duration:', audioElement.value.duration, 'using dur:', dur);

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
        console.log('Skip forward calculation: min(', current, '+', seconds, ',', dur, ') =', newTime);

        if (isNaN(newTime)) {
            console.error('Calculated newTime is NaN! current:', current, 'seconds:', seconds, 'dur:', dur);
            return;
        }

        seek(newTime);
    }

    function skipBackward(seconds = 5) {
        if (!audioElement.value) {
            console.error('Cannot skip backward - no audio element');
            return;
        }

        // Get current time directly from the audio element
        const current = audioElement.value.currentTime;

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

        console.log('Skip backward - current:', current, 'seconds:', seconds);

        const newTime = Math.max(current - seconds, 0);
        console.log('Skip backward calculation: max(', current, '-', seconds, ', 0) =', newTime);

        if (isNaN(newTime)) {
            console.error('Calculated newTime is NaN! current:', current, 'seconds:', seconds);
            return;
        }

        seek(newTime);
    }

    function setVolume(newVolume) {
        volume.value = Math.max(0, Math.min(1, newVolume));
        if (audioElement.value) {
            audioElement.value.volume = volume.value;
        }
    }

    return {
        // State
        audioElement,
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
        setAudioElement,
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
