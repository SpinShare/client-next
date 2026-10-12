<template>
    <div class="tooltip">
        <div class="trigger">
            <slot />
        </div>
        <div
            v-if="!disabled"
            :class="['content', { right: right }]"
        >
            <slot name="content" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    disabled: {
        type: Boolean,
        default: false,
    },
    right: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.tooltip {
    @apply inline-block relative;

    & .trigger {
        anchor-name: --tooltipTrigger;
    }
    & .trigger:hover + .content {
        @apply block;
    }
    & .content {
        @apply hidden absolute w-max max-w-[300px] bg-base-200 dark:bg-base-800 p-2 rounded-md z-10 shadow-2xl;
        position-anchor: --tooltipTrigger;
        position-area: start center;
    }
    & .right {
        position-area: right center;
        margin-left: 8px;
    }
}
</style>
