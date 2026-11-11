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

    <template v-if="isBigPicture">
        <BigPictureSearch />
        <BigPicturePicker />
    </template>
</template>

<script setup>
import bgmDefaultFile from '@/assets/audio/bgm_default.ogg?url';
import bgmClassicFile from '@/assets/audio/bgm_classic.ogg?url';
import queueDoneFile from '@/assets/audio/queue_done.ogg?url';
import errorFile from '@/assets/audio/error.ogg?url';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import UpdateToast from '@/components/UpdateToast.vue';
import { useRoute, useRouter } from 'vue-router';
import LibraryRebuildOverlay from '@/components/LibraryRebuildOverlay.vue';
import BigPictureSearch from '@/components/BigPicture/BigPictureSearch.vue';
import BigPicturePicker from '@/components/BigPicture/BigPicturePicker.vue';
import { isBigPicture } from '@/modules/gamepad/state';

const mitt = inject('mitt');
const route = useRoute();
const router = useRouter();
const externalApi = inject('externalApi');
const settingsManager = inject('settingsManager');
const updateManager = inject('updateManager');
const libraryManager = inject('libraryManager');
const cacheRebuildActive = ref(false);
const cacheRebuildStatus = ref(null);
const bgm = ref(null);
const sfxQueueDone = ref(null);
const sfxError = ref(null);
const updateAvailable = ref(false);
const isPreviewPlaying = ref(false);

const BGM_TRACKS = {
    '3.0': bgmDefaultFile,
    classic: bgmClassicFile,
};
let bgmTrackKey = null;
let bgmCustomObjectUrl = null;
let bgmTrackRequest = 0;

/**
 * @param {string} track - '3.0', 'classic' or 'custom'
 * @param {string} customPath
 */
async function applyBgmTrack(track, customPath) {
    const trackKey = track === 'custom' ? `custom:${customPath}` : track;
    if (trackKey === bgmTrackKey) return;
    bgmTrackKey = trackKey;
    const request = ++bgmTrackRequest;

    let source = BGM_TRACKS[track] ?? BGM_TRACKS['3.0'];
    let customObjectUrl = null;
    if (track === 'custom') {
        const customMusic = await externalApi.getCustomMusic();
        if (customMusic) {
            customObjectUrl = URL.createObjectURL(new Blob([customMusic.data], { type: customMusic.mimeType }));
            source = customObjectUrl;
        } else {
            console.error('BGM: Custom music could not be loaded, falling back to 3.0');
        }
    }

    // A newer track change happened while loading the custom music
    if (request !== bgmTrackRequest) {
        if (customObjectUrl) URL.revokeObjectURL(customObjectUrl);
        return;
    }

    const wasPlaying = !bgm.value.paused;
    bgm.value.src = source;
    if (bgmCustomObjectUrl) URL.revokeObjectURL(bgmCustomObjectUrl);
    bgmCustomObjectUrl = customObjectUrl;

    if (wasPlaying) {
        bgm.value.play().catch((e) => console.error('BGM play error:', e));
    }
}

function handleDismissUpdate() {
    updateAvailable.value = false;
    settingsManager.set('updateAvailable', false);
}

onMounted(async () => {
    bgm.value = new Audio();
    bgm.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    bgm.value.loop = true;
    bgm.value.addEventListener('ended', () => {
        bgm.value.currentTime = 0;
        bgm.value.play().catch((e) => console.error('BGM loop error:', e));
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
        bgm.value.volume = Math.pow(await settingsManager.get('musicVolume'), 2);
    });
    externalApi.onWindowBlurred(() => {
        bgm.value.volume = 0.0;
    });

    mitt.on('preview-play', () => {
        isPreviewPlaying.value = true;
        bgm.value.pause();
    });

    mitt.on('preview-stop', async () => {
        isPreviewPlaying.value = false;
        if (await settingsManager.get('musicEnabled')) {
            bgm.value.play().catch((e) => console.error('BGM resume error:', e));
        }
    });

    mitt.on('save-settings', (newSettings) => {
        if (newSettings.musicEnabled && !isPreviewPlaying.value) {
            bgm.value.play().catch((e) => console.error('BGM play error:', e));
        } else {
            bgm.value.pause();
        }
        bgm.value.volume = Math.pow(newSettings.musicVolume, 2);
        applyBgmTrack(newSettings.musicTrack, newSettings.musicCustomPath);

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
    mitt.on('sfx-experimental-unlocked', async () => {
        if (!(await settingsManager.get('sfxEnabled'))) return;

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

    await applyBgmTrack(await settingsManager.get('musicTrack'), await settingsManager.get('musicCustomPath'));
    bgm.value.volume = Math.pow(await settingsManager.get('musicVolume'), 2);
    if (await settingsManager.get('musicEnabled')) {
        bgm.value.play().catch((e) => console.error('BGM play error:', e));
    }

    updateManager.checkForUpdates();
});

onUnmounted(() => {
    bgm.value.pause();
    if (bgmCustomObjectUrl) URL.revokeObjectURL(bgmCustomObjectUrl);
    mitt.off('save-settings');
    mitt.off('preview-play');
    mitt.off('preview-stop');

    mitt.off('sfx-queue-done');
    mitt.off('sfx-experimental-unlocked');
    mitt.off('sfx-error');
    mitt.off('update-check-done');
    mitt.off('item-add');
});
</script>
