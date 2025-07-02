<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" />
    </router-view>

    <UpdateToast v-if="updateAvailable" @close="handleDismissUpdate" />
    <LibraryRebuildOverlay />
</template>

<script setup>
import bgmDefaultFile from "@/assets/audio/bgm_default.ogg?url";
import queueDoneFile from '@/assets/audio/queue_done.wav?url';
import successFile from '@/assets/audio/success.ogg?url';
import {inject, onMounted, onUnmounted, ref} from "vue";
import UpdateToast from "@/components/UpdateToast.vue";
import {useRoute, useRouter} from "vue-router";
import LibraryRebuildOverlay from "@/components/LibraryRebuildOverlay.vue";

const mitt = inject('mitt');
const route = useRoute();
const router = useRouter();
const settingsManager = inject('settingsManager');
const updateManager = inject('updateManager');
const bgmDefault = ref(null);
const sfxQueueDone = ref(null);
const sfxSuccess = ref(null);
const updateAvailable = ref(false);

function handleDismissUpdate() {
    updateAvailable.value = false;
    settingsManager.set('updateAvailable', false);
}

onMounted(async () => {
    if(!(await settingsManager.get('setupCompleted')) && !route.fullPath.includes("/setup")) {
        router.push('/setup/step/0');
    }
    if(await settingsManager.get('theme') === 'dark') {
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
    if(await settingsManager.get('musicEnabled')) {
        bgmDefault.value.play();
    }

    mitt.on('save-settings', (newSettings) => {
        if(newSettings.musicEnabled) {
            bgmDefault.value.play();
        } else {
            bgmDefault.value.pause();
        }

        if(newSettings.theme === 'dark') {
            document.documentElement.dataset.theme = 'dark';
        } else {
            document.documentElement.dataset.theme = '';
        }
    });

    sfxQueueDone.value = new Audio(queueDoneFile);
    sfxQueueDone.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    sfxSuccess.value = new Audio(successFile);
    sfxSuccess.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });

    mitt.on('sfx-queue-done', () => {
        sfxQueueDone.value.play();
    });
    mitt.on('sfx-success', () => {
        sfxSuccess.value.play();
    });
    mitt.on('update-check-done', (hasNewRelease) => {
        updateAvailable.value = hasNewRelease;
    });

    updateManager.checkForUpdates();
});

onUnmounted(() => {
    bgmDefault.value.pause();
    mitt.off('save-settings');

    mitt.off('sfx-queue-done');
    mitt.off('sfx-success');
    mitt.off('update-check-done');
});
</script>
