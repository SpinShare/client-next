<template>
    <RouterLink
        :class="`item-link`"
        :to="to"
    >
        <span class="label">{{ label }}</span>
    </RouterLink>
</template>

<script setup>
import { useLink } from 'vue-router';

const props = defineProps({
    to: {},
    label: {
        type: String,
        default: '',
    },
});

const { isExactActive } = useLink(props);
</script>

<style scoped>
@reference "@/assets/css/app.css";

.item-link {
    @apply transition-all px-5 h-[45px] text-base-400 flex items-center gap-2 border-b-2 border-b-transparent;

    &:hover {
        @apply cursor-pointer border-b-base-400 text-base-50;
    }
    &.router-link-exact-active {
        @apply text-brand-500 border-b-brand-500;
    }
}
</style>
