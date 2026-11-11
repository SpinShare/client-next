<template>
    <transition name="popup">
        <div
            v-if="request"
            class="bp-picker-backdrop"
            @click.self="close"
        >
            <div
                class="bp-picker"
                data-nav-scope
            >
                <h1 v-if="title">{{ title }}</h1>
                <div class="options">
                    <button
                        v-for="option in options"
                        :key="option.index"
                        :class="['option', { selected: option.selected }]"
                        :disabled="option.disabled"
                        :data-nav-autofocus="option.selected ? '' : null"
                        @click="choose(option)"
                        v-interactable
                    >
                        <span>{{ option.label }}</span>
                        <Remixicon
                            v-if="option.selected"
                            icon="check"
                        />
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed, inject, nextTick, watch } from 'vue';
import Remixicon from '@/components/Remixicon.vue';
import { gamepadState } from '@/modules/gamepad/state';

const navigation = inject('navigation');
let lastSelect = null;

const request = computed(() => gamepadState.pickerRequest);

const title = computed(() => {
    const select = request.value?.select;
    if (!select) return '';
    return select.closest('.settings-item')?.querySelector('.label h1')?.textContent?.trim() || select.getAttribute('aria-label') || '';
});

const options = computed(() => {
    const select = request.value?.select;
    if (!select) return [];
    return [...select.options].map((option, index) => ({
        index,
        label: option.textContent.trim(),
        value: option.value,
        selected: option.selected,
        disabled: option.disabled,
    }));
});

watch(request, async (newRequest) => {
    if (newRequest) {
        lastSelect = newRequest.select;
        await nextTick();
        navigation.ensureFocus();
        return;
    }
    if (lastSelect?.isConnected) {
        await nextTick();
        navigation.focusElement(lastSelect, { sound: false });
    }
    lastSelect = null;
});

function choose(option) {
    const select = request.value?.select;
    if (select && !option.selected) {
        select.selectedIndex = option.index;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close();
}

function close() {
    gamepadState.pickerRequest = null;
}
</script>

<style scoped>
.bp-picker-backdrop {
    @apply fixed inset-0 z-200 flex items-center justify-center backdrop-blur-md backdrop-brightness-50;

    & .bp-picker {
        @apply bg-base-100 dark:bg-base-900 rounded-xl p-6 w-full max-w-[520px] max-h-[80vh] flex flex-col gap-4 shadow-2xl;

        & h1 {
            @apply text-xl font-bold;
        }
        & .options {
            @apply flex flex-col gap-2 overflow-y-auto p-1;

            & .option {
                @apply flex items-center justify-between h-[52px] px-5 rounded bg-base-200 dark:bg-base-800 text-left text-lg transition-all cursor-pointer shrink-0;

                &:hover {
                    @apply bg-base-300 dark:bg-base-700;
                }
                &.selected {
                    @apply bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50;
                }
                &:disabled {
                    @apply opacity-40 cursor-not-allowed;
                }
            }
        }
    }
}
</style>
