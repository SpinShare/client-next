<template>
    <label :class="`i-switch ${disabled ? 'disabled' : ''}`">
        <input type="checkbox" v-model="val" :disabled="disabled" @input="handleInput" />
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

<style lang="scss" scoped>
.i-switch {
    height: 20px;
    width: 40px;
    display: block;
    position: relative;
    cursor: pointer;

    &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    & .background {
        position: absolute;
        z-index: 0;
        inset: 0;
        background: rgba(var(--colorBaseText), 0.14);
        border-radius: 40px;
        transition: 0.15s ease-in-out all;
    }

    input {
        appearance: none;
        background: rgba(var(--colorBaseText), 0.21);
        width: 10px;
        height: 10px;
        border-radius: 50px;
        position: absolute;
        z-index: 1;
        inset: 0;
        margin-top: 5px;
        margin-left: 5px;
        cursor: pointer;
        transition: 0.15s ease-in-out all;

        &:checked {
            background: rgb(var(--colorBaseText));
            margin-left: 25px;

            & + .background {
                background: rgb(var(--colorPrimary));
            }
        }
    }
    &:not(.disabled):hover {
        & .background {
            background: rgba(var(--colorBaseText), 0.21);
        }
        & input:checked + .background {
            background: rgba(var(--colorPrimary), 0.75);
        }
    }
}
</style>