<template>
    <div class="loading-circle">
        <div class="icon">
            <span class="mdi mdi-loading"></span>
        </div>
    </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.loading-circle {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    
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
</style>