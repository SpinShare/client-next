<template>
    <div class="loading-circle">
        <div class="icon">
            <span class="mdi mdi-loading"></span>
        </div>
    </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.loading-circle {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    animation: 0.3s loadingEntry linear forwards;

    & .icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 42px;
        animation: loadingLoop 0.4s linear infinite;
    }
}

@keyframes loadingEntry {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>
