<template>
    <AppLayout>
        <section class="view-error">
            <div class="error-box">
                <h1>Yikes!</h1>
                <p>Well this is embarrasing! Something somewhere went wrong, so we have to show you this funky looking error page!</p>
            </div>
        </section>
        I am Error
    </AppLayout>
</template>

<script setup>
import AppLayout from "@/layouts/AppLayout.vue";
</script>

<style lang="scss" scoped>
.view-error {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    & .error-box {
        max-width: 500px;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 15px;
        
        & h1 {
            font-size: 4em;
            font-weight: 600;
        }
        & p {
            color: rgba(var(--colorBaseText),0.6);
            line-height: 1.25em;
        }
    }
}
</style>