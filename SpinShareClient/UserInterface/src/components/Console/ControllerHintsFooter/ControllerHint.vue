<template>
    <button tabindex="-1">
        <div
            class="input"
        >
            <img
                :src="inputImage"
                alt="Input"
            />
        </div>
        <div class="label">
            {{ actionLabel }}
        </div>
    </button>
</template>

<script setup>
const props = defineProps({
    actionLabel: {
        type: String,
        default: 'Unknown',
    },
    inputLabel: {
        type: String,
        default: 'a',
    },
});

const inputImage = new URL(
    `../../../assets/inputs/button_${props.inputLabel}.svg`,
    import.meta.url,
).href;
</script>

<style lang="scss" scoped>
button {
    display: flex;
    gap: 8px;
    align-items: center;
    background: none;
    border: none;
    margin: 0;
    color: #fff;
    font-family: 'Work Sans', sans-serif;
    border-radius: 10px;
    padding: 4px 8px;
    transition: 0.1s ease-in-out all;
    text-transform: uppercase;

    & .input {
        height: 36px;
        min-width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;

        & img {
            max-height: 36px;
        }
    }
    & .label {
        font-size: 1.1rem;
        font-weight: 500;
        letter-spacing: 0.025rem;
    }

    &:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>
