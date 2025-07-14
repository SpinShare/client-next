<template>
    <dialog
        class="review-overlay"
        ref="reviewOverlay"
    >
        <section class="copy">
            <SectionHeader :title="$t('review.overlay.header')" />
        </section>

        <section class="form">
            <textarea class="textarea" v-model="reviewComment" rows="5" cols="5" :placeholder="$t('review.overlay.commentPlaceholder')"></textarea>

            <SettingsItem :label="$t('review.overlay.recommendedLabel')">
                <Switch v-model="reviewRecommended" />
            </SettingsItem>
        </section>

        <section class="actions">
            <button
                class="button"
                @click="save"
                :disabled="loading"
                v-interactable
            >
                <Remixicon icon="save" />
                <span>{{ $t('review.overlay.save') }}</span>
            </button>
            <button
                class="button brand"
                @click="close"
                :disabled="loading"
                v-interactable
            >
                <Remixicon icon="close" />
                <span>{{ $t('review.overlay.close') }}</span>
            </button>
        </section>
    </dialog>
</template>

<script setup>
import SectionHeader from "@/components/SectionHeader.vue";
import {inject, ref} from "vue";
import Remixicon from "@/components/Remixicon.vue";
import SettingsItem from "@/components/Settings/SettingsItem.vue";
import Switch from "@/components/Switch.vue";

const emits = defineEmits(['reviewUpdated']);

const props = defineProps({
    chartId: {
        type: String,
        required: true,
    },
    recommend: {
        type: [Boolean, null],
        default: null,
    },
    comment: {
        type: String,
        default: '',
    }
});

const connect = inject('connect');
const loading = ref(false);

const reviewOverlay = ref(null);
const reviewRecommended = ref(props.recommend === true);
const reviewComment = ref(props.comment);

function open() {
    reviewRecommended.value = props.recommend === true;
    reviewComment.value = props.comment;
    reviewOverlay.value.showModal();
}

function close() {
    reviewOverlay.value.close();
}

async function save() {
    loading.value = true;
    await connect.addReview(props.chartId, reviewRecommended.value === true, reviewComment.value);
    loading.value = false;
    emits('reviewUpdated');
    close();
}

defineExpose({
    open,
    close,
});
</script>

<style scoped>
.review-overlay:open {
    @apply bg-base-900 text-base-100 w-full max-w-[600px] m-auto rounded-md p-5 flex flex-col gap-4 transition-all border border-base-300 dark:border-base-800;

    @starting-style {
        @apply opacity-0;
    }

    &::backdrop {
        @apply fixed inset-0 p-5 flex flex-col justify-center items-center z-100 backdrop-blur-md backdrop-brightness-75 transition-all;

        @starting-style {
            @apply opacity-0;
        }
    }

    & .copy {
        @apply flex flex-col gap-2;

        & h1 {
            @apply text-xl;
        }
        & p {
            @apply text-base-500 dark:text-base-300;
        }
    }

    & .form {
        @apply flex flex-col gap-4;
    }

    & .actions {
        @apply flex gap-2 justify-end;
    }
}
</style>