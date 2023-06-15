<template>
    <header
        :class="`type-${type}`"
    >
        <h1>{{ label }}</h1>
        <div class="actions">
            <slot />
        </div>
    </header>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'default',
    }
});
</script>

<style lang="scss" scoped>
header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 25px;
    align-items: center;
    
    & h1 {
        font-size: 1.5rem;
        font-weight: 700;
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
