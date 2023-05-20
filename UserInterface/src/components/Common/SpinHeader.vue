<template>
    <header>
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
        font-size: 1.5em;
        font-weight: 700;
    }
    & .actions {
        display: flex;
        gap: 5px;
    }
}
</style>
