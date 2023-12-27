<template>
    <div class="spin-tab-bar">
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
import { ref, watch } from 'vue';

const emit = defineEmits(['change']);
const props = defineProps({
    selected: {
        type: Number,
        default: 0,
    },
    tabs: {
        type: Array,
        default: () => [],
    },
});

const activeTab = ref(props.selected);

const handleTabChange = (i) => {
    activeTab.value = i;
    emit('change', i);
};

watch(
    () => props.selected,
    (oldSelected, newSelected) => {
        console.log('change ' + oldSelected + ',' + newSelected);
        activeTab.value = newSelected;
    },
);
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
    border-bottom: 1px solid rgba(var(--colorBaseText), 0.07);
    padding: 0 25px;
    gap: 10px;
}
</style>
