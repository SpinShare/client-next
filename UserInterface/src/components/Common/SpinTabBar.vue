<template>
    <div
        class="spin-tab-bar"
    >
        <SpinTabItem
            v-for="(item, i) in tabs"
            :key="i"
            :active="i === activeTab"
            @click="handleTabChange(i)"
        >
            {{ item }}
        </SpinTabItem>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['change']);
const props = defineProps({
    tabs: {
        type: Array,
        default: () => [],
    }
});

const activeTab = ref(0);

const handleTabChange = (i) => {
    activeTab.value = i;
    emit('change', i);
}
</script>

<style lang="scss" scoped>
.spin-tab-bar {
    background: rgb(var(--colorBase));
    position: sticky;
    z-index: 10;
    left: 60px;
    right: 0;
    top: 0;
    display: flex;
    border-bottom: 1px solid rgba(var(--colorBaseText),0.07);
    padding: 0 25px;
    gap: 10px;
}
</style>
