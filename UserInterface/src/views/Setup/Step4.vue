<template>
    <SetupLayout
        :step="4"
        title="You're done!"
        @back="handleBack"
        @continue="handleContinue"
        :can-continue="!savingSettings"
    >
        <img src="@/assets/setup_finish.svg" />
        <p>Congratulations, you've tuned up everything perfectly! Your setup is complete and now you're all set to explore and install new charts. Your Spin Rhythm XD journey is about to hit a new high note with SpinShare. Let's start spinning and sharing the rhythm!</p>
    </SetupLayout>
</template>

<script setup>
import { ref, inject } from 'vue';
import router from "@/router";
import SetupLayout from "@/layouts/SetupLayout.vue";
const emitter = inject('emitter');

const savingSettings = ref(false);

const handleBack = () => {
    router.push({ path: '/setup/step-3' });
};

emitter.on('settings-set-response', (settings) => {
    savingSettings.value = false;
    router.push({ path: '/' });
});

const handleContinue = () => {
    window.external.sendMessage(JSON.stringify({
        command: "settings-set",
        data: [{
            key: 'app.setup.done',
            value: true,
        }],
    }));

    savingSettings.value = true;
};
</script>