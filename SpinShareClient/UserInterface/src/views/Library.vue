<template>
    <AppLayout>
        <section class="view-library">
            <SpinHeader :label="t('library.title')">
                <SpinButton
                    icon="folder"
                    v-tooltip="t('library.browseFiles')"
                    @click="handleOpenLibrary"
                />
                <SpinButton
                    icon="plus"
                    v-tooltip="t('library.importBackup')"
                    :disabled="importingChart"
                    :loading="importingChart"
                    @click="handleOpenBackup"
                />
                <SpinButton
                    icon="refresh"
                    v-tooltip="t('library.rebuildCache')"
                    @click="handleRebuildCache"
                />
            </SpinHeader>
            <SpinLoader v-if="loadingLibrary" />
            <LibraryChartList
                v-if="!loadingLibrary"
                :charts="library"
            />
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted, inject, nextTick } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import LibraryChartList from '@/components/Library/LibraryChartList.vue';
import router from '@/router';
import SpinButton from '@/components/Common/SpinButton.vue';
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
import { Buttons, focusableElements } from '@/modules/useGamepad';
const { t } = useI18n();

const importingChart = ref(false);
const loadingLibrary = ref(false);
const library = ref([]);

onMounted(async () => {
    loadLibrary();

    if (window.spinshare.settings.IsConsole) {
        // Select first Element
        await nextTick();
        const firstFocusableElement = document.body
            .querySelector('.view-library')
            .querySelector(focusableElements);

        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }

        // Controller Hints
        let controllerHintItems = [];

        controllerHintItems.push({
            input: Buttons.A,
            label: t('general.select'),
            onclick: () => {
                const focussedElement = document.body.querySelector('*:focus');
                if (focussedElement) {
                    focussedElement.click();
                }
            },
        });

        emitter.emit('console-update-controller-hints', {
            showMenu: true,
            showBack: true,
            items: controllerHintItems,
        });
    }
});

const handleOpenLibrary = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'library-open-in-explorer',
            data: '',
        }),
    );
};

const handleOpenBackup = () => {
    importingChart.value = true;
    window.external.sendMessage(
        JSON.stringify({
            command: 'library-open-and-install-backup',
            data: '',
        }),
    );
};

const loadLibrary = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'library-get',
            data: '',
        }),
    );

    loadingLibrary.value = true;
};

const handleRebuildCache = () => {
    // TODO: Custom Page
    router.push({ path: '/setup/step-2' });
};

emitter.on('library-get-response', (response) => {
    loadingLibrary.value = false;
    library.value = response;
});

emitter.on('library-open-and-install-backup-response', (response) => {
    importingChart.value = false;

    if (response === true) {
        loadLibrary();
    } else if (response === 'local-backup-has-no-charts-exception') {
        emitter.emit('alert-show', {
            title: t('library.importBackupError.localBackupHasNoCharts.title'),
            message: t(
                'library.importBackupError.localBackupHasNoCharts.message',
            ),
        });
    }
});
</script>

<style lang="scss" scoped>
.view-library {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
