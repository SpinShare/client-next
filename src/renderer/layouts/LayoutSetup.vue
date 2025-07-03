<template>
    <div class="layout-setup">
        <div class="header">
            <div class="steps">
                <div :class="`step ${isFutureStep(0) ? 'future' : ''}`"></div>
                <div :class="`line ${!isFutureStep(1) ? 'past' : ''}`"></div>
                <div :class="`step ${isFutureStep(1) ? 'future' : ''}`"></div>
                <div :class="`line ${!isFutureStep(2) ? 'past' : ''}`"></div>
                <div :class="`step ${isFutureStep(2) ? 'future' : ''}`"></div>
                <div :class="`line ${!isFutureStep(3) ? 'past' : ''}`"></div>
                <div :class="`step ${isFutureStep(3) ? 'future' : ''}`"></div>
                <div :class="`line ${!isFutureStep(4) ? 'past' : ''}`"></div>
                <div :class="`step ${isFutureStep(4) ? 'future' : ''}`"></div>
            </div>

            <div class="actions">
                <button
                    @click="handleBack"
                    class="button"
                    :disabled="currentStep < 1"
                    v-interactable
                >
                    <Remixicon icon="arrow-left" />
                </button>
                <button
                    @click="handleContinue"
                    class="button brand"
                    v-interactable
                >
                    <Remixicon icon="arrow-right" v-if="currentStep < 4" />
                    <Remixicon icon="check" v-else />
                </button>
            </div>
        </div>
        <main>
            <router-view />
        </main>
    </div>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {computed, inject, onMounted} from "vue";
import Remixicon from "@/components/Remixicon.vue";

const settingsManager = inject('settingsManager');
const router = useRouter();
const route = useRoute();
const currentStep = computed(() => {
    return Number(route.fullPath?.split('/')[3]) || 0;
});

function isFutureStep(step) {
    return currentStep.value < step;
}

function handleBack() {
    router.push(`/setup/step/${currentStep.value - 1}`);
}
async function handleContinue() {
    if(currentStep.value === 4) {
        await settingsManager.set('setupCompleted', true);
        router.push('/');
    } else {
        router.push(`/setup/step/${currentStep.value + 1}`);
    }
}
</script>

<style scoped>
.layout-setup {
    @apply flex flex-col self-center items-center justify-center grow overflow-hidden p-8 gap-5;

    & .header {
        @apply w-full max-w-xl flex gap-5 items-center;

        & .steps {
            @apply flex items-center gap-2 grow;

            & .step {
                @apply w-3 h-3 rounded-full  bg-base-400 dark:bg-base-200;

                &.future {
                    @apply  bg-base-200 dark:bg-base-700;
                }
            }
            & .line {
                @apply w-4 h-1 bg-base-200 dark:bg-base-800 rounded-full;

                &.past {
                    @apply bg-base-400 dark:bg-base-200;
                }
            }
        }
        & .actions {
            @apply flex gap-2;
        }
    }
    & main {
        @apply border border-base-300 dark:border-base-800 rounded-md p-5 w-full max-w-xl overflow-y-auto max-h-[80vh];
    }
}
</style>
