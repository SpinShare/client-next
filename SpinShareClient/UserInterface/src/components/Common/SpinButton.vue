<template>
    <button
        @click="emit('click')"
        :disabled="disabled"
        :class="`color-${color} ${reversed ? 'reversed' : ''}`"
    >
        <span v-if="loading" :class="`loading mdi mdi-loading`"></span>
        <span v-if="icon && !loading" :class="`mdi mdi-${icon}`"></span>
        <span v-if="label" class="label">{{ label }}</span>
    </button>
</template>

<script setup>
const emit = defineEmits(['click']);

defineProps({
    label: {
        type: [String, Boolean],
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: [String, Boolean],
        default: false,
    },
    reversed: {
        type: [String, Boolean],
        default: false,
    },
    color: {
        type: String,
        default: 'default',
    }
});
</script>

<style lang="scss" scoped>
button {
    background: rgba(var(--colorBaseText), 0.07);
    color: rgb(var(--colorBaseText));
    border-radius: 4px;
    padding: 0 15px;
    height: 40px;
    border: none;
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
    transition: 0.15s ease-in-out all;
    
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
    & .label {
        font-family: 'Work Sans', sans-serif;
        font-size: 1rem;
    }
    
    &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
    }
    &.reversed {
        flex-direction: row-reverse;
    }
    
    &.color-default {
        background: rgba(var(--colorBaseText), 0.07);
        color: rgb(var(--colorBaseText));
    }
    &.color-primary {
        background: rgba(var(--colorPrimary),0.2);
        color: rgb(var(--colorPrimary));
    }
    &.color-danger {
        background: rgba(var(--colorError),0.2);
        color: rgb(var(--colorError));
    }
    &.color-success {
        background: rgba(var(--colorSuccess),0.2);
        color: rgb(var(--colorSuccess));
    }
    &.color-bright {
        background: rgba(var(--colorBaseText),0.8);
        color: rgb(var(--colorBase));
    }
    &.color-transparent {
        background: transparent;
        color: rgb(var(--colorBaseText));
    }
    
    &:not([disabled]):hover {
        cursor: pointer;
        background: rgba(var(--colorBaseText),0.14);
        
        &.color-default {
            background: rgba(var(--colorBaseText),0.14);
        }
        &.color-primary {
            background: rgba(var(--colorPrimary),0.35);
        }
        &.color-danger {
            background: rgba(var(--colorError),0.35);
        }
        &.color-success {
            background: rgba(var(--colorSuccess),0.35);
        }
        &.color-bright {
            background: rgb(var(--colorBaseText));
        }
        &.color-transparent {
            background: rgba(var(--colorBaseText), 0.07);
            color: rgb(var(--colorBaseText));
        }
    }
}

@keyframes loadingLoop {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>