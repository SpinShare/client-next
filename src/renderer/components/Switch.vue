<template>
    <label :class="`spin-switch ${disabled ? 'disabled' : ''}`">
        <input
            type="checkbox"
            v-model="val"
            :disabled="disabled"
            @input="handleInput"
        />
        <span class="background"></span>
    </label>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['update:modelValue']);

const val = ref('');

watch(
    () => props.modelValue,
    (nVal) => (val.value = nVal),
    {
        immediate: true,
    },
);

const handleInput = () => emit('update:modelValue', !val.value);
</script>

<style scoped>
.spin-switch {
    @apply h-[25px] w-[50px] block relative cursor-pointer;

    &.disabled {
        @apply opacity-40 cursor-not-allowed;
    }
    & .background {
        @apply absolute z-0 inset-0 bg-base-800 rounded-full transition-all;
    }

    input {
        @apply appearance-none w-[15px] h-[15px] bg-base-200 rounded-full absolute z-10 inset-0 mt-[5px] ml-[5px] cursor-pointer transition-all;

        &:checked {
            @apply bg-brand-800 ml-[30px];

            & + .background {
                @apply bg-brand-500;
            }
        }
    }
    &:not(.disabled):hover {
        & .background {
            @apply bg-base-700;
        }
        & input:checked + .background {
            @apply bg-brand-400;
        }
    }
}
</style>
