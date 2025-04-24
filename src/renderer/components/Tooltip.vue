<template>
    <div class="tooltip">
        <div class="trigger">
            <slot />
        </div>
        <div class="content">
            <slot name="content" />
        </div>
    </div>
</template>

<script setup></script>

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
        @apply hidden absolute w-[300px] bg-base-800 p-2 rounded z-10;
        position-anchor: --tooltipTrigger;
        position-area: start center;
    }
}
</style>
