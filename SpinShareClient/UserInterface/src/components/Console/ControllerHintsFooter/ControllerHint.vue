<template>
    <button tabindex="-1">
        <div
            class="input"
            :class="{ long: inputLabel.length > 1 }"
        >
            {{ inputLabel }}
        </div>
        <div class="label">
            {{ actionLabel }}
        </div>
    </button>
</template>

<script setup>
defineProps({
    actionLabel: {
        type: String,
        default: 'Unknown',
    },
    inputLabel: {
        type: String,
        default: 'A',
    },
});
</script>

<style lang="scss" scoped>
button {
    display: flex;
    gap: 10px;
    align-items: center;
    background: none;
    border: none;
    margin: 0;
    color: #fff;
    font-family: 'Work Sans', sans-serif;
    border-radius: 10px;
    padding: 8px;
    transition: 0.1s ease-in-out all;
    text-transform: uppercase;

    & .input {
        height: 32px;
        min-width: 32px;
        background: #fff;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100px;
        font-size: 1rem;
        font-weight: bold;
        line-height: 1rem;

        &.long {
            padding: 0 15px;
        }
    }
    & .label {
        font-size: 1rem;
        font-weight: 400;
        letter-spacing: 0.05rem;
    }

    &:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>
