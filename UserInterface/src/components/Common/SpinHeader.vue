<template>
    <header>
        <h1>{{ label }}</h1>
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
    & h1 {
        font-size: 1.5em;
        font-weight: 700;
    }
}
</style>
