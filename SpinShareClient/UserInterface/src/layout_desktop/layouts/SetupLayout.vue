<template>
    <section class="layout-setup">
        <main>
            <div class="stepper">
                <div
                    class="step"
                    :class="{ active: step >= 1 }"
                ></div>
                <div
                    class="step"
                    :class="{ active: step >= 2 }"
                ></div>
                <div
                    class="step"
                    :class="{ active: step >= 3 }"
                ></div>
                <div
                    class="step"
                    :class="{ active: step >= 4 }"
                ></div>
            </div>

            <header>
                <img src="../../assets/icon.svg" />
                <div class="subheader">{{ t('setup.title') }}</div>
                <div class="step-title">{{ title }}</div>
            </header>

            <section class="content">
                <slot />
            </section>

            <section class="actions">
                <SpinButton
                    color="transparent"
                    icon="arrow-left"
                    v-if="step !== 0 && step !== 4"
                    @click="handleBack"
                    :disabled="!canContinue"
                />
                <SpinButton
                    :icon="step !== 4 ? 'arrow-right' : 'check'"
                    @click="handleContinue"
                    :disabled="!canContinue"
                />
            </section>
        </main>
    </section>
</template>

<script setup>
const emit = defineEmits(['back', 'continue']);

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

defineProps({
    step: {
        type: Number,
        default: 0,
    },
    title: {
        type: String,
        default: '[Missing Title]',
    },
    canBack: {
        type: Boolean,
        default: true,
    },
    canContinue: {
        type: Boolean,
        default: true,
    },
});

const handleBack = () => {
    emit('back');
};
const handleContinue = () => {
    emit('continue');
};
</script>

<style lang="scss">
.layout-setup {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;

    & main {
        max-width: 500px;
        min-height: 300px;
        width: calc(100% - 50px);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 25px;

        & > .stepper {
            width: 100%;
            display: flex;
            justify-content: stretch;

            & .step {
                width: 100%;
                height: 3px;
                background: rgba(var(--colorBaseText), 0.15);

                &:first-child {
                    border-top-left-radius: 5px;
                    border-bottom-left-radius: 5px;
                }
                &:last-child {
                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                }

                &.active {
                    background: rgb(var(--colorPrimary));
                    box-shadow: 0 0 12px rgb(var(--colorPrimary));
                }
            }
        }
        & > header {
            display: grid;
            grid-template-columns: 24px 1fr;
            gap: 5px 15px;
            align-items: center;

            & img {
                width: 24px;
                height: 24px;
                grid-row: 1 / span 2;
            }
            & .subheader {
                color: rgba(var(--colorBaseText), 0.4);
                font-size: 0.9rem;
            }
            & .step-title {
                font-size: 1.5rem;
                font-weight: 700;
            }
        }
        & > .content {
            display: grid;
            gap: 25px;

            & img {
                max-width: 200px;
                max-height: 200px;
                margin: 0 auto;
            }
            & p {
                color: rgba(var(--colorBaseText), 0.6);
                line-height: 1.5rem;
            }
        }
        & > .actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
    }
}
</style>
