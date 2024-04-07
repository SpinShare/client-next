<template>
    <div
        ref="DOMDropdown"
        @focusout="closeDropdown"
        tabindex="0"
        class="spin-select"
        :class="`${disabled ? 'disabled' : ''}`"
    >
        <div
            @click="toggleDropdown"
            class="button"
        >
            <span
                :class="`mdi mdi-${
                    options.find((x) => x.value === modelValue)?.icon
                }`"
            ></span>
            <span class="value">{{
                options.find((x) => x.value === modelValue)?.label || 'Select'
            }}</span>
            <span
                :class="`mdi mdi-menu-${showDropdown ? 'up' : 'down'}`"
            ></span>
        </div>
        <transition name="default">
            <div
                v-show="showDropdown"
                class="options"
            >
                <div
                    v-for="option in options"
                    :key="option.value"
                    @click="selectOption(option.value)"
                    :class="`option ${
                        modelValue === option.value ? 'selected' : ''
                    }`"
                >
                    <span :class="`mdi mdi-${option.icon}`"></span>
                    <span class="label">{{ option.label }}</span>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: String,
    options: {
        type: Array,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const DOMDropdown = ref(null);
const showDropdown = ref(false);
const selectedValue = ref(props.modelValue);
const emit = defineEmits(['update:modelValue']);

const toggleDropdown = () => {
    if (props.disabled) return;
    showDropdown.value = !showDropdown.value;
};

const selectOption = (value) => {
    if (props.disabled) return;
    selectedValue.value = value;
    emit('update:modelValue', value);
    showDropdown.value = false;
};

const closeDropdown = () => {
    showDropdown.value = false;
};
</script>

<style lang="scss" scoped>
.spin-select {
    position: relative;
    min-width: 175px;
    transition: 0.15s ease-in-out all;

    & .button {
        cursor: pointer;
        background: rgba(var(--colorBaseText), 0.07);
        color: rgb(var(--colorBaseText));
        border-radius: 4px;
        padding: 0 15px;
        height: 40px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 6px;
        position: relative;
        overflow: hidden;
        transition: 0.15s ease-in-out all;

        & .value {
            flex-grow: 1;
            font-family: 'Work Sans', sans-serif;
            font-size: 1rem;
        }

        & .mdi {
            width: 24px;
            height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;

            &.loading {
                animation: loadingLoop 0.4s linear infinite;
            }
        }
    }
    & .options {
        position: absolute;
        width: 100%;
        background: rgb(var(--colorBase2));
        color: rgb(var(--colorBaseText));
        z-index: 1;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        overflow: hidden;

        & .option {
            cursor: pointer;
            display: grid;
            grid-template-columns: 24px auto;
            gap: 10px;
            align-items: center;
            color: var(--colorBaseText);
            transition: 0.15s ease-in-out all;
            padding: 0 15px;
            height: 40px;

            & .mdi {
                width: 24px;
                height: 24px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 20px;
            }

            &.selected {
                background: rgb(var(--colorBase3));
            }
            &:hover {
                background: rgb(var(--colorBase3));
            }
        }
    }

    &.disabled {
        opacity: 0.3;

        & .button {
            cursor: not-allowed;
        }
    }
    &:not(.disabled) {
        & .button {
            &:hover {
                cursor: pointer;
                background: rgba(var(--colorBaseText), 0.14);
            }
        }
    }
}
</style>
