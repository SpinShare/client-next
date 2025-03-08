<template>
    <span :class="`icon ri-${icon}-${filled ? 'fill' : 'line'} ${sizes[size]}`"></span>
</template>

<script setup>
const sizes = {
    "xs": "text-xs",
    "sm": "text-sm",
    "md": "text-md",
    "lg": "text-lg",
    "xl": "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
    "7xl": "text-7xl",
    "8xl": "text-8xl",
    "9xl": "text-9xl",
}

defineProps({
    icon: {
        type: String,
        required: true,
    },
    filled: {
        type: Boolean,
        required: false,
        default: false,
    },
    size: {
        type: String,
        required: false,
        default: "lg",
    },
});
</script>

<style scoped>
@reference "@css/app.css";
</style>