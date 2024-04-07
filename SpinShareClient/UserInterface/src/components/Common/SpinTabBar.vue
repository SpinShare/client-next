<template>
    <div class="spin-tab-bar">
        <div
            class="console-hint left"
            v-if="window.spinshare.settings.IsConsole"
        >
            <div class="hint-prompt">L</div>
        </div>
        <SpinTabItem
            v-for="(item, i) in tabs"
            :key="i"
            :active="i === activeTab"
            @click="handleTabChange(i)"
        >
            {{ item }}
        </SpinTabItem>
        <div
            class="console-hint right"
            v-if="window.spinshare.settings.IsConsole"
        >
            <div class="hint-prompt">R</div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import useGamepad, { Buttons } from '@/modules/useGamepad';

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

if (window.spinshare.settings.IsConsole) {
    const gamepad = useGamepad();
    gamepad.on('buttonReleased', async (buttonIndex) => {
        switch (buttonIndex) {
            case Buttons.LEFT_BUMPER:
                if (activeTab.value > 0) {
                    handleTabChange(activeTab.value - 1);
                } else {
                    handleTabChange(props.tabs.length - 1);
                }
                break;
            case Buttons.RIGHT_BUMPER:
                if (activeTab.value === props.tabs.length - 1) {
                    handleTabChange(0);
                } else {
                    handleTabChange(activeTab.value + 1);
                }
                break;
        }
    });
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
    border-bottom: 1px solid rgba(var(--colorBaseText), 0.07);
    padding: 0 25px;
    gap: 10px;
}

.ui-console .spin-tab-bar {
    position: relative;
    justify-content: center;
    border: 0;
    gap: 5px;
    padding: 25px 40px;
    left: 0;
    align-items: center;

    & .console-hint {
        display: flex;
        align-items: center;
        flex-grow: 1;

        &.left {
            justify-content: flex-start;

            & .hint-prompt {
                border-top-left-radius: 20px;
            }
        }
        &.right {
            justify-content: flex-end;

            & .hint-prompt {
                border-top-right-radius: 20px;
            }
        }

        & .hint-prompt {
            height: 42px;
            width: 42px;
            border-radius: 3px;
            background: #fff;
            color: #000;
            font-size: 1rem;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
