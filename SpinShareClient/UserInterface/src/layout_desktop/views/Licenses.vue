<template>
    <AppLayout>
        <section class="view-licenses">
            <SpinHeader :label="t('settings.thirdPartyLicenses.label')">
                <SpinButton
                    icon="arrow-left"
                    :label="t('general.back')"
                    @click="handleBack"
                />
            </SpinHeader>

            <div class="content">
                <VueComponent />
            </div>
        </section>
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/layout_desktop/layouts/AppLayout.vue';
import { VueComponent } from '@/assets/third-party-licenses.md';
import router from '@/layout_desktop/router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const handleBack = () => {
    router.push({
        path: '/settings',
    });
};
</script>

<style lang="scss">
.view-licenses {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;

    & > header {
        padding: 15px 40px;
        border-bottom: 1px solid rgba(var(--colorBaseText), 0.07);
    }

    & > .content {
        padding: 40px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: scroll;
        word-break: break-all;
        line-height: 1.15rem;
        font-size: 0.85rem;

        & ul {
            list-style-type: none;
            margin-top: 25px;
        }
        & h1,
        ul li {
            font-weight: 600;
            font-size: 1.15rem;
            line-height: 2rem;
        }
        & p,
        code {
            color: rgba(var(--colorBaseText), 0.6);
            line-height: 1.15rem;
        }
        & ol {
            padding-left: 20px;
        }
        & img {
            display: none;
        }
    }
}
</style>
