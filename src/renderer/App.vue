<template>
    <router-view v-slot="{ Component }">
        <component
            :is="Component"
            :key="route.fullPath"
        />
    </router-view>

    <UpdateToast
        v-if="updateAvailable"
        @close="handleDismissUpdate"
    />
    <LibraryRebuildOverlay
        v-if="cacheRebuildActive && cacheRebuildStatus"
        :status="cacheRebuildStatus"
    />
</template>

<script setup>
import bgmDefaultFile from '@/assets/audio/bgm_default.ogg?url';
import queueDoneFile from '@/assets/audio/queue_done.wav?url';
import errorFile from '@/assets/audio/error.ogg?url';
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';
import UpdateToast from '@/components/UpdateToast.vue';
import { useRoute, useRouter } from 'vue-router';
import LibraryRebuildOverlay from '@/components/LibraryRebuildOverlay.vue';
import { useAudioPlayer } from '@/composables/useAudioPlayer';

const { isPlaying: audioPlayerPlaying } = useAudioPlayer();
const mitt = inject('mitt');
const route = useRoute();
const router = useRouter();
const externalApi = inject('externalApi');
const settingsManager = inject('settingsManager');
const updateManager = inject('updateManager');
const libraryManager = inject('libraryManager');
const cacheRebuildActive = ref(false);
const cacheRebuildStatus = ref(null);
const bgmDefault = ref(null);
const sfxQueueDone = ref(null);
const sfxError = ref(null);
const updateAvailable = ref(false);
const isPreviewPlaying = ref(false);

let bgmFadeInterval = null;

function fadeBgm(targetVolume, durationMs, onComplete) {
    if (bgmFadeInterval) clearInterval(bgmFadeInterval);
    if (!bgmDefault.value) return;

    const startVolume = bgmDefault.value.volume;
    const steps = 20;
    const stepTime = durationMs / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    bgmFadeInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
            clearInterval(bgmFadeInterval);
            bgmFadeInterval = null;
            bgmDefault.value.volume = targetVolume;
            if (onComplete) onComplete();
        } else {
            bgmDefault.value.volume = Math.max(0, Math.min(1, startVolume + volumeStep * currentStep));
        }
    }, stepTime);
}

function handleDismissUpdate() {
    updateAvailable.value = false;
    settingsManager.set('updateAvailable', false);
}

onMounted(async () => {
    bgmDefault.value = new Audio(bgmDefaultFile);
    bgmDefault.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    bgmDefault.value.loop = true;
    bgmDefault.value.addEventListener('ended', () => {
        bgmDefault.value.currentTime = 0;
        bgmDefault.value.play().catch((e) => console.error('BGM loop error:', e));
    });

    sfxQueueDone.value = new Audio(queueDoneFile);
    sfxQueueDone.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    sfxError.value = new Audio(errorFile);
    sfxError.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });

    libraryManager.onCacheRebuildStart(() => {
        cacheRebuildActive.value = true;
    });
    libraryManager.onCacheRebuildProgress((status) => {
        cacheRebuildStatus.value = status;
        cacheRebuildActive.value = true;
    });
    libraryManager.onCacheRebuildDone(() => {
        cacheRebuildActive.value = false;
    });
    externalApi.onWindowFocused(async () => {
        if (!audioPlayerPlaying.value) {
            bgmDefault.value.volume = await settingsManager.get('musicVolume');
        }
    });
    externalApi.onWindowBlurred(() => {
        if (!audioPlayerPlaying.value) {
            bgmDefault.value.volume = 0.0;
        }
    });

    mitt.on('preview-play', () => {
        isPreviewPlaying.value = true;
        bgmDefault.value.pause();
    });

    mitt.on('preview-stop', async () => {
        isPreviewPlaying.value = false;
        if (await settingsManager.get('musicEnabled')) {
            bgmDefault.value.play().catch((e) => console.error('BGM resume error:', e));
        }
    });

    mitt.on('save-settings', (newSettings) => {
        if (audioPlayerPlaying.value) {
            // Don't resume BGM while audio player is active
            if (!newSettings.musicEnabled) {
                bgmDefault.value.pause();
            }
        } else {
            if (newSettings.musicEnabled) {
                bgmDefault.value.play();
            } else {
                bgmDefault.value.pause();
            }
            bgmDefault.value.volume = newSettings.musicVolume;
        }

        if (newSettings.theme === 'dark') {
            document.documentElement.dataset.theme = 'dark';
        } else {
            document.documentElement.dataset.theme = '';
        }
    });

    mitt.on('sfx-queue-done', async () => {
        if (!(await settingsManager.get('downloadNotifications'))) return;

        sfxQueueDone.value.volume = Math.pow(await settingsManager.get('sfxVolume'), 2);
        await sfxQueueDone.value.play().catch((e) => console.error('SFX play error:', e));
    });
    mitt.on('sfx-error', async () => {
        if (!(await settingsManager.get('downloadNotifications'))) return;

        sfxError.value.volume = Math.pow(await settingsManager.get('sfxVolume'), 2);
        await sfxError.value.play().catch((e) => console.error('SFX play error:', e));
    });
    mitt.on('update-check-done', (hasNewRelease) => {
        updateAvailable.value = hasNewRelease;
    });
    mitt.on('item-add', async () => {
        if (await settingsManager.get('openDownloadsSidebar')) {
            mitt.emit('queue-open');
        }
    });

    if (!(await settingsManager.get('setupCompleted')) && !route.fullPath.includes('/setup')) {
        router.push('/setup/step/0');
    }
    if ((await settingsManager.get('theme')) === 'dark') {
        document.documentElement.dataset.theme = 'dark';
    } else {
        document.documentElement.dataset.theme = '';
    }

    bgmDefault.value.volume = Math.pow(await settingsManager.get('musicVolume'), 2);
    if (await settingsManager.get('musicEnabled')) {
        bgmDefault.value.play().catch((e) => console.error('BGM play error:', e));
    }

    updateManager.checkForUpdates();
});

watch(audioPlayerPlaying, async (playing) => {
    if (!bgmDefault.value) return;
    const musicEnabled = await settingsManager.get('musicEnabled');
    if (!musicEnabled) return;

    if (playing) {
        fadeBgm(0, 800, () => {
            bgmDefault.value.pause();
        });
    } else {
        const musicVolume = await settingsManager.get('musicVolume');
        bgmDefault.value.volume = 0;
        bgmDefault.value.play();
        fadeBgm(musicVolume, 800);
    }
});

onUnmounted(() => {
    if (bgmFadeInterval) clearInterval(bgmFadeInterval);
    bgmDefault.value.pause();
    mitt.off('save-settings');
    mitt.off('preview-play');
    mitt.off('preview-stop');

    mitt.off('sfx-queue-done');
    mitt.off('sfx-error');
    mitt.off('update-check-done');
    mitt.off('item-add');
});
</script>
