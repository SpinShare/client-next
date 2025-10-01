<template>
    <div :class="`settings-item ${twoLine ? 'two-line' : ''}`">
        <div class="label">
            <h1>{{ label }}</h1>
            <p v-if="description">{{ description }}</p>
        </div>
        <div class="content">
            <slot />
        </div>
        <div class="error" v-if="error">
            {{ error }}
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
    error: {
        type: [String, Boolean],
        default: false,
    },
    twoLine: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.settings-item {
    @apply grid grid-cols-1 gap-2.5;

    &.two-line {
        @apply flex flex-col items-stretch;
    }

    & .label {
        @apply flex flex-col;

        & p {
            @apply text-base-500 dark:text-base-300;
        }
    }
    & .content {
        @apply flex gap-2 items-center justify-end;
    }

    & .error {
      @apply text-red-700 dark:text-red-400 text-sm;
    }
}

@media screen and (min-width: 1100px) {
    .settings-item {
        @apply grid-cols-[3fr_4fr] items-center;
    }
}
</style>
