<template>
    <AppLayout>
        <section class="view-error">
            <div class="error-box">
                <h1>{{ t('general.error.title') }}</h1>
                <p>{{ t('general.error.message') }}</p>
            </div>
        </section>
    </AppLayout>
</template>

<script setup>
import AppLayout from "@/layout_desktop/layouts/AppLayout.vue";

import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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
            font-size: 4rem;
            font-weight: 600;
        }
        & p {
            color: rgba(var(--colorBaseText),0.6);
            line-height: 1.25rem;
        }
    }
}
</style>