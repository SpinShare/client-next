<template>
    <AppLayout>
        <section
            class="view-chart-detail"
            v-if="chart"
        >
            <header>
                <div
                    class="cover"
                    :style="`background-image: url(${chart.paths.cover})`"
                ></div>
                <div class="meta">
                    <div class="title">{{ chart.title }}</div>
                    <div
                        class="subtitle"
                        v-if="chart.subtitle"
                    >
                        {{ chart.subtitle }}
                    </div>
                    <div class="artist">
                        {{ chart.artist }} &bull; {{ chart.charter }}
                    </div>
                    <div class="difficulties">
                        <span :class="{ active: chart.hasEasyDifficulty }">
                            <span>E</span>
                            <span v-if="chart.hasEasyDifficulty">{{
                                chart.easyDifficulty
                            }}</span>
                        </span>
                        <span :class="{ active: chart.hasNormalDifficulty }">
                            <span>N</span>
                            <span v-if="chart.hasNormalDifficulty">{{
                                chart.normalDifficulty
                            }}</span>
                        </span>
                        <span :class="{ active: chart.hasHardDifficulty }">
                            <span>H</span>
                            <span v-if="chart.hasHardDifficulty">{{
                                chart.hardDifficulty
                            }}</span>
                        </span>
                        <span :class="{ active: chart.hasExtremeDifficulty }">
                            <span>EX</span>
                            <span v-if="chart.hasExtremeDifficulty">{{
                                chart.expertDifficulty
                            }}</span>
                        </span>
                        <span :class="{ active: chart.hasXDDifficulty }">
                            <span>XD</span>
                            <span v-if="chart.hasXDDifficulty">{{
                                chart.XDDifficulty
                            }}</span>
                        </span>
                    </div>
                    <div class="actions">
                        <template v-if="libraryState && !queueState">
                            <template v-if="libraryState.installed">
                                <SpinButton
                                    v-if="libraryState.updated"
                                    icon="trash-can-outline"
                                    color="danger"
                                    :label="t('chart.detail.actions.remove')"
                                    @click="handleRemove"
                                />
                                <SpinButton
                                    v-else
                                    icon="update"
                                    color="success"
                                    :label="t('chart.detail.actions.update')"
                                    @click="handleAddToQueue"
                                />
                                <SpinButton
                                    icon="controller"
                                    :label="t('chart.detail.actions.play')"
                                />
                            </template>
                            <template v-else>
                                <SpinButton
                                    icon="download"
                                    color="primary"
                                    :label="t('general.addToQueue')"
                                    @click="handleAddToQueue"
                                />
                            </template>
                        </template>
                        <template v-else-if="queueState">
                            <SpinButton
                                loading
                                :label="
                                    queueState === 0
                                        ? t('chart.detail.actions.queued')
                                        : t('chart.detail.actions.downloading')
                                "
                                disabled
                            />
                        </template>
                        <template v-else>
                            <SpinButton
                                loading
                                :label="t('general.loading')"
                                disabled
                            />
                        </template>
                        <SpinButton
                            icon="open-in-new"
                            v-tooltip="t('general.openOnSpinShare')"
                            @click="handleOpenInBrowser"
                        />
                        <SpinButton
                            icon="flag-outline"
                            v-tooltip="t('general.report')"
                            @click="handleReport"
                        />
                    </div>
                </div>
            </header>
            <SpinTabBar
                :tabs="[
                    t('chart.detail.tabBar.overview'),
                    t('chart.detail.tabBar.reviews'),
                    t('chart.detail.tabBar.spinPlays'),
                    t('chart.detail.tabBar.playlists'),
                ]"
                @change="handleTabChange"
            />
            <TabOverview
                v-if="currentTab === TAB_OVERVIEW"
                :description="chart.description"
                :tags="chart.tags"
                :views="chart.views"
                :downloads="chart.downloads"
                :is-explicit="chart.isExplicit"
                :upload-date="chart.uploadDate"
                :update-date="chart.updateDate"
                :uploader="chart.uploader"
            />
            <TabReviews
                v-if="currentTab === TAB_REVIEWS"
                :id="chart.id"
            />
            <TabSpinPlays
                v-if="currentTab === TAB_SPINPLAYS"
                :id="chart.id"
            />
            <TabPlaylists
                v-if="currentTab === TAB_PLAYLISTS"
                :id="chart.id"
            />
        </section>
        <section
            class="view-chart-loading"
            v-else
        >
            <SpinLoader />
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { getChart } from '@/api/api';
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import AppLayout from '../../layouts/AppLayout.vue';
import TabOverview from '@/layout_desktop/components/Chart/Detail/TabOverview.vue';
import TabReviews from '@/layout_desktop/components/Chart/Detail/TabReviews.vue';
import TabSpinPlays from '@/layout_desktop/components/Chart/Detail/TabSpinPlays.vue';
import TabPlaylists from '@/layout_desktop/components/Chart/Detail/TabPlaylists.vue';

const route = useRoute();
const chart = ref(null);
const libraryState = ref(null);
const queueState = ref(null);

onMounted(async () => {
    chart.value = await getChart(route.params.chartId);
    checkLibraryState();
});

emitter.on('library-remove-response', () => {
    checkLibraryState();
});

emitter.on('library-get-state-response', (state) => {
    if (state.spinshareReference === chart.value.fileReference) {
        libraryState.value = state;
    }
});

emitter.on('queue-item-update-response', (item) => {
    if (chart.value.id === item.ID) {
        queueState.value = item.State;

        // Done
        if (item.State === 5) {
            queueState.value = false;
            checkLibraryState();
        }
    }
});

const checkLibraryState = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'library-get-state',
            data: {
                fileReference: chart.value.fileReference,
                updateHash: chart.value.updateHash,
            },
        }),
    );
};

const handleOpenInBrowser = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'open-in-browser',
            data: 'https://spinsha.re/song/' + chart.value.id,
        }),
    );
};

const handleReport = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'open-in-browser',
            data: 'https://spinsha.re/report/song/' + chart.value.id,
        }),
    );
};

const handleAddToQueue = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'queue-add',
            data: {
                id: chart.value.id,
                title: chart.value.title,
                artist: chart.value.artist,
                charter: chart.value.charter,
                cover: chart.value.cover,
                fileReference: chart.value.fileReference,
            },
        }),
    );
};

const handleRemove = () => {
    libraryState.value = null;

    window.external.sendMessage(
        JSON.stringify({
            command: 'library-remove',
            data: chart.value.fileReference,
        }),
    );
};

const currentTab = ref(0);

const TAB_OVERVIEW = 0;
const TAB_REVIEWS = 1;
const TAB_SPINPLAYS = 2;
const TAB_PLAYLISTS = 3;

const handleTabChange = (i) => {
    currentTab.value = i;
};
</script>

<style lang="scss" scoped>
.view-chart-loading {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-chart-detail {
    & header {
        padding: 25px 40px;
        height: 200px;
        border-radius: 6px;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 25px;
        align-items: center;
        transition: 0.15s ease-in-out all;

        & .cover {
            width: 160px;
            height: 160px;
            border-radius: 4px;
            background-position: center;
            background-size: cover;
        }
        & .meta {
            display: grid;
            gap: 5px;

            & .title {
                font-size: 1.15rem;
            }
            & .subtitle {
                color: rgba(var(--colorBaseText), 0.4);
                margin-bottom: 5px;
            }
            & .artist {
                color: rgba(var(--colorBaseText), 0.4);
                font-size: 0.9rem;
            }
            & .difficulties {
                display: flex;
                gap: 5px;
                margin-top: 5px;

                & > span {
                    padding: 3px 7px;
                    background: rgba(var(--colorBaseText), 0.07);
                    border-radius: 2px;
                    font-size: 0.6rem;

                    & span:nth-child(1) {
                        font-weight: bold;
                    }
                    & span:nth-child(2) {
                        margin-left: 5px;
                    }

                    &:not(.active) {
                        opacity: 0.4;
                        cursor: not-allowed;
                    }
                }
            }
            & .actions {
                margin-top: 10px;
                display: flex;
                gap: 5px;
            }
        }
    }
}
</style>
