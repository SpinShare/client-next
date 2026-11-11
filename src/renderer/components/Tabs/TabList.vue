<template>
    <section
        class="tab-list"
        data-nav-tabs
        data-nav-group
    >
        <ButtonGlyph
            v-if="isBigPicture"
            button="LB"
            class="tab-glyph"
        />
        <slot />
        <ButtonGlyph
            v-if="isBigPicture"
            button="RB"
            class="tab-glyph"
        />
    </section>
</template>

<script setup>
import ButtonGlyph from '@/components/BigPicture/ButtonGlyph.vue';
import { isBigPicture } from '@/modules/gamepad/state';
</script>

<style scoped>
.tab-list {
    @apply flex px-10 items-center border-b border-base-300 dark:border-base-800 flex-wrap;

    & .tab-glyph {
        @apply mx-2 opacity-70;
    }
}

:root.big-picture .tab-list {
    @apply justify-center gap-1 px-6 py-3 border-b-0 flex-nowrap overflow-x-auto;
    scrollbar-width: none;
}
</style>
