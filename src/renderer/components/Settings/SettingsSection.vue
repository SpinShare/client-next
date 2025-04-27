<template>
    <section class="section-settings">
        <SectionHeader
            v-if="label"
            :title="label"
        />
        <div class="content">
            <slot />
        </div>
    </section>
</template>

<script setup>
import SectionHeader from '@/components/SectionHeader.vue';

defineProps({
    label: {
        type: [String, Boolean],
        default: false,
    },
});
</script>

<style scoped>
.section-settings {
    @apply flex flex-col gap-2.5;

    & .content {
        @apply border border-base-800 rounded-md p-5 flex flex-col gap-5;
    }
}
</style>
