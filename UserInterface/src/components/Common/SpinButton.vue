<template>
    <button
        @click="emit('click')"
        :disabled="disabled"
        :class="`color-${color}`"
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
    color: {
        type: String,
        default: 'default',
    }
});
</script>

<style lang="scss" scoped>
button {
    background: rgba(255,255,255,0.07);
    color: #fff;
    border-radius: 4px;
    padding: 0 15px;
    height: 40px;
    border: none;
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
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
        font-size: 16px;
    }
    
    &[disabled] {
        opacity: 0.3;
        cursor: not-allowed;
    }
    
    &.color-default {
        background: rgba(255,255,255,0.07);
        color: #fff;
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
        background: rgba(255,255,255,0.8);
        color: #222;
    }
    &.color-transparent {
        background: transparent;
        color: #fff;
    }
    
    &:not([disabled]):hover {
        cursor: pointer;
        background: rgba(255,255,255,0.14);
        
        &.color-default {
            background: rgba(255,255,255,0.14);
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
            background: #fff;
        }
        &.color-transparent {
            background: rgba(255,255,255,0.07);
            color: #fff;
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