<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" />
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
import { inject, onMounted, onUnmounted, ref } from 'vue';
import UpdateToast from '@/components/UpdateToast.vue';
import { useRoute, useRouter } from 'vue-router';
import LibraryRebuildOverlay from '@/components/LibraryRebuildOverlay.vue';

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

function handleDismissUpdate() {
    updateAvailable.value = false;
    settingsManager.set('updateAvailable', false);
}

onMounted(async () => {
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
    externalApi.onWindowFocused(() => {
        bgmDefault.value.volume = 0.5;
    });
    externalApi.onWindowBlurred(() => {
        bgmDefault.value.volume = 0.0;
    });

    if (!(await settingsManager.get('setupCompleted')) && !route.fullPath.includes('/setup')) {
        router.push('/setup/step/0');
    }
    if ((await settingsManager.get('theme')) === 'dark') {
        document.documentElement.dataset.theme = 'dark';
    } else {
        document.documentElement.dataset.theme = '';
    }

    bgmDefault.value = new Audio(bgmDefaultFile);
    bgmDefault.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    bgmDefault.value.loop = true;
    bgmDefault.value.volume = 0.5;
    if (await settingsManager.get('musicEnabled')) {
        bgmDefault.value.play();
    }

    mitt.on('save-settings', (newSettings) => {
        if (newSettings.musicEnabled) {
            bgmDefault.value.play();
        } else {
            bgmDefault.value.pause();
        }

        if (newSettings.theme === 'dark') {
            document.documentElement.dataset.theme = 'dark';
        } else {
            document.documentElement.dataset.theme = '';
        }
    });

    sfxQueueDone.value = new Audio(queueDoneFile);
    sfxQueueDone.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    sfxError.value = new Audio(errorFile);
    sfxError.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });

    mitt.on('sfx-queue-done', async () => {
        if (!(await settingsManager.get('downloadNotifications'))) return;

        await sfxQueueDone.value.play();
    });
    mitt.on('sfx-error', async () => {
        if (!(await settingsManager.get('downloadNotifications'))) return;

        await sfxError.value.play();
    });
    mitt.on('update-check-done', (hasNewRelease) => {
        updateAvailable.value = hasNewRelease;
    });
    mitt.on('item-add', async () => {
        if (await settingsManager.get('openDownloadsSidebar')) {
            mitt.emit('queue-open');
        }
    });

    updateManager.checkForUpdates();
});

onUnmounted(() => {
    bgmDefault.value.pause();
    mitt.off('save-settings');

    mitt.off('sfx-queue-done');
    mitt.off('sfx-error');
    mitt.off('update-check-done');
    mitt.off('item-add');
});
</script>
