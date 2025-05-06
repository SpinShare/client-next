<template>
    <router-view v-slot="{ Component }">
        <component :is="Component" />
    </router-view>
</template>

<script setup>
import bgmDefaultFile from "@/assets/audio/bgm_default.ogg?url";
import queueDoneFile from '@/assets/audio/queue_done.wav?url';
import successFile from '@/assets/audio/success.ogg?url';
import {inject, onMounted, onUnmounted, ref} from "vue";

const mitt = inject('mitt');
const bgmDefault = ref(null);
const sfxQueueDone = ref(null);
const sfxSuccess = ref(null);

onMounted(() => {
    bgmDefault.value = new Audio(bgmDefaultFile);
    bgmDefault.value.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });
    bgmDefault.value.loop = true;
    bgmDefault.value.volume = 0.5;
    bgmDefault.value.play();
    mitt.on('save-settings', (newSettings) => {
        if(newSettings.musicEnabled) {
            bgmDefault.value.play();
        } else {
            bgmDefault.value.pause();
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
});

onUnmounted(() => {
    bgmDefault.value.pause();
    mitt.off('save-settings');

    mitt.off('sfx-queue-done');
    mitt.off('sfx-success');
})
</script>
