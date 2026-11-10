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
    /* Every tooltip uses the same anchor name, so keep it local to each instance */
    anchor-scope: --tooltipTrigger;

    & .trigger {
        anchor-name: --tooltipTrigger;
    }
    & .trigger:hover + .content {
        @apply block;
    }
    & .content {
        /* fixed: position-area is resolved against the viewport instead of the trigger-sized .tooltip box,
           which would push the content back on top of the trigger */
        @apply hidden fixed w-max max-w-[300px] bg-base-200 dark:bg-base-900 text-sm p-2 rounded-md z-10 shadow-2xl pointer-events-none;
        position-anchor: --tooltipTrigger;
        position-area: start center;
    }
    & .right {
        position-area: right center;
        margin-left: 8px;
    }
}
</style>
