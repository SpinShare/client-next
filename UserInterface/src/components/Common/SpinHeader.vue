<template>
    <header
        :class="`type-${type}`"
    >
        <h1 v-if="label">{{ label }}</h1>
        <div class="actions">
            <slot />
        </div>
    </header>
</template>

<script setup>
defineProps({
    label: {
        type: [String, Boolean],
        default: false,
    },
    type: {
        type: String,
        default: 'default',
    }
});
</script>

<style lang="scss" scoped>
header {
    display: flex;
    gap: 25px;
    align-items: center;
    justify-content: center;
    
    & h1 {
        font-size: 1.5rem;
        font-weight: 700;
        flex-grow: 1;
    }
    & .actions {
        display: flex;
        gap: 5px;
    }
    
    &.type-small {
        & h1 {
            font-size: 1.15rem;
        }
    }
}
</style>
