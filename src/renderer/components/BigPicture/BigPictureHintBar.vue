<template>
    <footer class="bp-hintbar">
        <div class="status">
            <template v-if="gamepadState.isEditingText && isSteam">
                <Remixicon icon="keyboard-box" />
                <span>{{ $t('bigPicture.hints.steamKeyboard') }}</span>
            </template>
        </div>
        <div class="hints">
            <button
                v-for="hint in hints"
                :key="hint.action"
                class="hint"
                tabindex="-1"
                data-nav-skip
                @click="navigation.handleAction(hint.action, { pointer: true })"
            >
                <ButtonGlyph
                    v-for="button in hint.buttons"
                    :key="button"
                    :button="button"
                />
                <span>{{ hint.label }}</span>
            </button>
        </div>
    </footer>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import Remixicon from '@/components/Remixicon.vue';
import ButtonGlyph from '@/components/BigPicture/ButtonGlyph.vue';
import { gamepadState } from '@/modules/gamepad/state';

const { t } = useI18n();
const navigation = inject('navigation');

const isSteam = computed(() => gamepadState.platform.isLaunchedBySteam || gamepadState.platform.isSteamOS || gamepadState.platform.isGamescope);

const hints = computed(() => {
    const focused = gamepadState.focusedHints;
    const list = [];

    if (focused.textInput) {
        list.push({ buttons: ['A'], action: 'accept', label: gamepadState.isEditingText ? t('bigPicture.hints.confirm') : t('bigPicture.hints.keyboard') });
    } else {
        list.push({ buttons: ['A'], action: 'accept', label: t('bigPicture.hints.select') });
    }
    list.push({ buttons: ['B'], action: 'back', label: t('bigPicture.hints.back') });
    if (focused.x) list.push({ buttons: ['X'], action: 'secondary', label: focused.x });

    if (gamepadState.sidebarOpen) {
        list.push({ buttons: ['START'], action: 'menu', label: t('bigPicture.hints.close') });
        return list;
    }
    if (gamepadState.accountOpen) return list;

    list.push({ buttons: ['Y'], action: 'search', label: t('bigPicture.hints.search') });
    if (gamepadState.pageHasPagination) {
        list.push({ buttons: ['LT', 'RT'], action: 'nextPage', label: t('bigPicture.hints.page') });
    }
    list.push({ buttons: ['SELECT'], action: 'downloads', label: t('bigPicture.hints.downloads') });
    list.push({ buttons: ['START'], action: 'menu', label: t('bigPicture.hints.menu') });
    return list;
});
</script>

<style scoped>
.bp-hintbar {
    @apply flex items-center justify-between gap-4 h-[52px] px-8 border-t border-base-200 dark:border-base-900 bg-base-50/80 dark:bg-base-950/80 backdrop-blur-md relative z-60;

    & .status {
        @apply flex items-center gap-2 text-sm text-base-600 dark:text-base-300 min-w-0;
    }

    & .hints {
        @apply flex items-center gap-5;

        & .hint {
            @apply flex items-center gap-2 text-sm text-base-700 dark:text-base-200 cursor-pointer whitespace-nowrap;

            &:hover {
                @apply text-base-950 dark:text-base-50;
            }
        }
    }
}
</style>
