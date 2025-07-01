<template>
    <div class="update-toast">
        <Remixicon icon="refresh" size="4xl" />
        <div class="content">
            <h1>Update available</h1>
            <p>Update to the latest version to receive new features and bugfixes.</p>

            <div class="actions">
                <button @click="handleGetUpdate" class="button brand">
                    <span>Get update</span>
                </button>
                <button @click="handleLater" class="button ghost">
                    <span>Later</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import Remixicon from "@/components/Remixicon.vue";
import {inject} from "vue";

const externalApi = inject('externalApi');
const emits = defineEmits(['close']);

function handleGetUpdate() {
    externalApi.openUrl('https://github.com/SpinShare/client-next/releases/latest');
}
function handleLater() {
    emits('close');
}
</script>

<style scoped>
.update-toast {
    @apply fixed bottom-10 right-10 z-50 p-5 bg-base-950 border border-base-800 rounded-md shadow-lg w-[400px] grid grid-cols-[auto_1fr] gap-5;

    & .content {
        @apply flex flex-col gap-2;

        & h1 {
            @apply text-lg font-bold;
        }
        & .actions {
            @apply mt-2.5 flex gap-2;
        }
    }
}
</style>