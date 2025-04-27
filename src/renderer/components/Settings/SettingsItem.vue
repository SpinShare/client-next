<template>
    <div class="settings-item">
        <div class="label">
            <h1>{{ label }}</h1>
            <p v-if="description">{{ description }}</p>
        </div>
        <div class="content">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true,
    },
    description: {
        type: [String, Boolean],
        default: false,
    },
});
</script>

<style scoped>
.settings-item {
    @apply grid grid-cols-1 gap-2.5;

    & .label {
        @apply flex flex-col;

        & p {
            @apply text-base-400;
        }
    }
    & .content {
        @apply flex gap-2 items-center justify-end;
    }
}

@media screen and (min-width: 1100px) {
    .settings-item {
        @apply grid-cols-[3fr_4fr] items-center;
    }
}
</style>
