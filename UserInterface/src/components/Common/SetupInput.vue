<template>
    <label
        class="setup-input"
        :class="`type-${type}`"
    >
        <div class="text">
            <div class="label">{{ label }}</div>
            <div class="hint" v-if="hint">{{ hint }}</div>
        </div>
        <div class="input">
            <slot />
        </div>
    </label>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true,
    },
    hint: {
        type: [String, Boolean],
        default: false,
    },
    type: {
        type: String,
        default: 'default',
    },
});
</script>

<style lang="scss">
.setup-input {
    display: grid;
    gap: 10px;
    
    &.type-switch {
        grid-template-columns: 1fr auto;
        gap: 50px;
        align-items: center;
    }

    & .text {
        display: flex;
        flex-direction: column;
        gap: 10px;
        
        & .label {
            font-size: 0.9em;
        }
        & .hint {
            color: rgba(255,255,255,0.4);
            line-height: 1.25em;
        }
    }
    & .input {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 5px;

        & input[type=text] {
            background: rgba(255,255,255,0.07);
            border: 0;
            color: #fff;
            font-family: 'Work Sans', sans-serif;
            font-size: 1em;
            border-radius: 4px;
            padding: 0 15px;
            height: 40px;

            &:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
        }
        & .select {
            position: relative;
            
            & select {
                width: 100%;
                appearance: none;
                background: rgba(255,255,255,0.07);
                border: 0;
                color: #fff;
                font-family: 'Work Sans', sans-serif;
                font-size: 1em;
                border-radius: 4px;
                padding: 0 15px;
                height: 40px;

                & option {
                    background: #222;
                    color: #fff;
                }
            }

            & .mdi {
                pointer-events: none;
                position: absolute;
                right: 10px;
                top: 9px;
                font-size: 22px;
            }
        }
    }
}
</style>