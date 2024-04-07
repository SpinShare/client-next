<template>
    <section class="search-intro">
        <div class="content">
            <span class="mdi mdi-card-search"></span>
            <h1>{{ t('search.intro.title') }}</h1>
            <p>{{ t('search.intro.text') }}</p>
        </div>
    </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.search-intro {
    display: flex;
    justify-content: center;
    align-items: center;

    & .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        & .mdi {
            font-size: 64px;
        }
        & h1 {
            font-size: 1.5rem;
        }
        & p {
            color: rgba(var(--colorBaseText), 0.6);
            max-width: 400px;
            line-height: 1.5rem;
            text-align: center;
        }
    }
}
</style>
