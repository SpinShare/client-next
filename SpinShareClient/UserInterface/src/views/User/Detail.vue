<template>
    <AppLayout>
        <section
            class="view-user-detail"
            v-if="user"
        >
            <header>
                <img
                    :src="user.avatar"
                    alt="User Avatar"
                />
                <div class="meta">
                    <div class="username">{{ user.username }}</div>
                    <div
                        class="pronouns"
                        v-if="user.pronouns"
                    >
                        {{ user.pronouns }}
                    </div>
                    <div
                        class="tags"
                        v-if="user.isPatreon || user.isVerified"
                    >
                        <span
                            class="tag tag-verified"
                            v-if="user.isVerified"
                        >
                            <span class="mdi mdi-check"></span>
                            <span>{{ t('user.verified') }}</span>
                        </span>
                        <span
                            class="tag tag-supporter"
                            v-if="user.isPatreon"
                        >
                            <span class="mdi mdi-heart"></span>
                            <span>{{ t('user.supporter') }}</span>
                        </span>
                    </div>
                    <div class="actions">
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
                    t('user.detail.tabBar.overview'),
                    t('user.detail.tabBar.charts', [user.songs]),
                    t('user.detail.tabBar.playlists', [user.playlists]),
                    t('user.detail.tabBar.reviews', [user.reviews]),
                    t('user.detail.tabBar.spinPlays', [user.spinplays]),
                ]"
                @change="handleTabChange"
            />
            <TabOverview
                v-if="currentTab === TAB_OVERVIEW"
                :cards="user.cards"
            />
            <TabCharts
                v-if="currentTab === TAB_CHARTS"
                :id="user.id"
            />
            <TabPlaylists
                v-if="currentTab === TAB_PLAYLISTS"
                :id="user.id"
            />
            <TabReviews
                v-if="currentTab === TAB_REVIEWS"
                :id="user.id"
            />
            <TabSpinPlays
                v-if="currentTab === TAB_SPINPLAYS"
                :id="user.id"
            />
        </section>
        <section
            class="view-user-loading"
            v-else
        >
            <SpinLoader />
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { useRoute } from 'vue-router';
import { getUser } from '@/api/api';
import TabOverview from '@/components/User/Detail/TabOverview.vue';
import TabCharts from '@/components/User/Detail/TabCharts.vue';
import TabPlaylists from '@/components/User/Detail/TabPlaylists.vue';
import TabReviews from '@/components/User/Detail/TabReviews.vue';
import TabSpinPlays from '@/components/User/Detail/TabSpinPlays.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const route = useRoute();
const user = ref(null);

onMounted(async () => {
    user.value = await getUser(route.params.userId);
});

const handleReport = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'open-in-browser',
            data: 'https://spinsha.re/report/user/' + user.value.id,
        }),
    );
};

const handleOpenInBrowser = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'open-in-browser',
            data: 'https://spinsha.re/user/' + user.value.id,
        }),
    );
};

const currentTab = ref(0);

const TAB_OVERVIEW = 0;
const TAB_CHARTS = 1;
const TAB_PLAYLISTS = 2;
const TAB_REVIEWS = 3;
const TAB_SPINPLAYS = 4;

const handleTabChange = (i) => {
    currentTab.value = i;
};
</script>

<style lang="scss" scoped>
.view-user-loading {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-user-detail {
    & header {
        padding: 40px;
        padding-bottom: 20px;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 20px;
        align-items: center;

        & img {
            width: 96px;
            height: 96px;
            border-radius: 256px;
        }
        & .meta {
            display: flex;
            flex-direction: column;
            gap: 3px;

            & .username {
                align-items: center;
                display: flex;
                gap: 10px;
                font-size: 1.25rem;
            }
            & .pronouns {
                font-size: 0.75rem;
                color: rgba(var(--colorBaseText), 0.4);
            }
            & .tags {
                margin-top: 2px;
                align-items: center;
                display: flex;
                gap: 5px;

                & .tag {
                    background: rgba(var(--colorBaseText), 0.07);
                    display: flex;
                    gap: 5px;
                    padding: 3px 10px 3px 7px;
                    border-radius: 100px;
                    align-items: center;

                    & > span:nth-child(2) {
                        font-size: 0.75rem;
                        line-height: 0.75rem;
                    }

                    &.tag-verified {
                        background: rgba(var(--colorSuccess), 0.2);
                        color: rgba(var(--colorSuccess));
                    }
                    &.tag-supporter {
                        background: rgba(var(--colorPrimary), 0.2);
                        color: rgba(var(--colorPrimary));
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
