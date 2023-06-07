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

    &.type-horizontal {
        grid-template-columns: 1fr auto;
        gap: 50px;
        align-items: center;
    }
    &.type-library-path {
        & .input {
            grid-template-columns: 1fr auto auto;
        }
    }

    & .text {
        display: flex;
        flex-direction: column;
        gap: 10px;
        
        & .label {
            font-size: 0.9em;
        }
        & .hint {
            color: rgba(var(--colorBaseText),0.4);
            line-height: 1.25em;
        }
    }
    & .input {
        display: grid;
        gap: 5px;

        & input[type=text] {
            background: rgba(var(--colorBaseText),0.07);
            border: 0;
            color: rgb(var(--colorBaseText));
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
            cursor: pointer;
            
            & select {
                width: 100%;
                appearance: none;
                background: rgba(var(--colorBaseText),0.07);
                border: 0;
                color: rgb(var(--colorBaseText));
                font-family: 'Work Sans', sans-serif;
                font-size: 1em;
                border-radius: 4px;
                padding: 0 15px;
                height: 40px;
                margin-right: 25px;

                & option {
                    background: rgb(var(--colorBase));
                    color: rgb(var(--colorBaseText));
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