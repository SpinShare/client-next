<template>
    <div class="auth-area">
        <RouterLink
            to="/connect/login"
            class="button ghost"
            v-if="!isLoggedIn"
            v-interactable
        >
            <Remixicon icon="key" />
            <span>{{ $t('header.auth.login') }}</span>
        </RouterLink>

        <template v-else>
            <template v-if="!profile">
                <Loader
                    :size="24"
                    :border-width="4"
                />
            </template>
            <template v-else>
                <button
                    class="button brand"
                    v-interactable
                    @click="handleUpload"
                >
                    <Remixicon icon="upload" />
                    <span>{{ $t('header.auth.upload') }}</span>
                </button>

                <button
                    class="button"
                    v-interactable
                    @click="connectNotificationPopupOpen = !connectNotificationPopupOpen"
                >
                    <Remixicon icon="notification" />
                    <span class="badge" v-if="notifications.length">{{ notifications.length || 0 }}</span>
                </button>
                <transition name="popup">
                    <div
                        v-if="connectNotificationPopupOpen"
                        :class="`connect-notification-popup`"
                    >
                        <header>
                            <h1>{{ $t('header.auth.notifications.header') }}</h1>

                            <button
                                class="button ghost"
                                v-interactable
                                @click="handleNotificationClearAll"
                            >
                                <Remixicon icon="delete-bin" />
                            </button>
                        </header>

                        <div class="notifications">
                            <EmptyState :label="$t('header.auth.notifications.noNotifications')" icon="notification" class="m-4" v-if="notifications.length === 0" />

                            <button
                                class="item"
                                v-interactable
                                v-for="notification in notifications"
                                :key="notification.id"
                                @click="handleNotificationClick(notification)"
                            >
                                <template
                                    v-if="notification.notificationType === NOTIFICATION_TYPE_SYSTEM"
                                >
                                    <Remixicon icon="megaphone" />
                                    <p>{{ notification.notificationData }}</p>
                                </template>
                                <template
                                    v-if="notification.notificationType === NOTIFICATION_TYPE_NEWREVIEW"
                                >
                                    <div class="chart-icon" :style="`background-image: url(${notification.connectedSong.cover})`"></div>
                                    <p>{{ $t('header.auth.notifications.newReview', { username: notification.connectedUser.username, title: notification.connectedSong.title }) }}</p>
                                </template>
                                <template
                                    v-if="notification.notificationType === NOTIFICATION_TYPE_NEWSPINPLAY"
                                >
                                    <div class="chart-icon" :style="`background-image: url(${notification.connectedSong.cover})`"></div>
                                    <p>{{ $t('header.auth.notifications.newSpinPlay', { username: notification.connectedUser.username, title: notification.connectedSong.title }) }}</p>
                                </template>
                                <template
                                    v-if="notification.notificationType === NOTIFICATION_TYPE_RECEIVEDCARD"
                                >
                                    <div class="card-icon" :style="`background-image: url(${notification.connectedCard.icon})`"></div>
                                    <p>{{ $t('header.auth.notifications.receivedCard', { card: notification.connectedCard.title }) }}</p>
                                </template>
                            </button>
                        </div>
                    </div>
                </transition>

                <button
                    class="button profile-button"
                    :style="`background-image: url('${profile.avatar}')`"
                    @click="connectProfilePopupOpen = !connectProfilePopupOpen"
                    v-interactable
                ></button>
                <transition name="popup">
                    <div
                        v-if="connectProfilePopupOpen"
                        :class="`connect-profile-popup`"
                    >
                        <header>
                            <div class="content">
                                <div class="username">
                                    <span>@{{ profile.username }}</span>
                                </div>
                                <div
                                    class="pronouns"
                                    v-if="profile.pronouns"
                                >
                                    {{ profile.pronouns }}
                                </div>
                            </div>
                            <div class="flags">
                                <div
                                    class="badge-supporter"
                                    v-if="profile.isPatreon"
                                >
                                    <Remixicon
                                        icon="heart"
                                        size="sm"
                                    />
                                </div>
                                <div
                                    class="badge-verified"
                                    v-if="profile.isVerified"
                                >
                                    <Remixicon
                                        icon="check"
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </header>
                        <nav>
                            <RouterLink
                                :to="`/user/${profile.id}`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="user"
                                    size="xl"
                                />
                                <span>{{ $t('header.auth.profile') }}</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/charts`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="music-2"
                                    size="xl"
                                />
                                <span>{{ $t('header.auth.charts') }}</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/reviews`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="award"
                                    size="xl"
                                />
                                <span>{{ $t('header.auth.reviews') }}</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/playlists`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="album"
                                    size="xl"
                                />
                                <span>{{ $t('header.auth.playlists') }}</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/spinplays`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="youtube"
                                    size="xl"
                                />
                                <span>{{ $t('header.auth.spinPlays') }}</span>
                            </RouterLink>
                        </nav>
                        <nav>
                            <button
                                class="item"
                                @click="handleLogout"
                                v-interactable
                            >
                                <Remixicon
                                    icon="door-open"
                                    size="xl"
                                />
                                <span>{{ $t('header.auth.logout') }}</span>
                            </button>
                        </nav>
                    </div>
                </transition>
            </template>
        </template>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import Loader from '@/components/Loader.vue';
import {
    NOTIFICATION_TYPE_NEWREVIEW,
    NOTIFICATION_TYPE_NEWSPINPLAY,
    NOTIFICATION_TYPE_RECEIVEDCARD,
    NOTIFICATION_TYPE_SYSTEM
} from "@spinshare/api-js";
import EmptyState from "@/components/EmptyState.vue";
import router from "@/router";

const mitt = inject('mitt');
const connect = inject('connect');
const externalApi = inject('externalApi');
const isLoggedIn = ref(false);
const profile = ref(null);
const notifications = ref([]);
const connectProfilePopupOpen = ref(false);
const connectNotificationPopupOpen = ref(false);
const notificationCheckInterval = ref(null);

onMounted(async () => {
    mitt.on('auth-updated', onAuthUpdated);
    await onAuthUpdated();
});

onUnmounted(() => {
    mitt.off('auth-updated');
});

async function onAuthUpdated() {
    isLoggedIn.value = await connect.isLoggedIn();

    if(notificationCheckInterval.value) {
        clearInterval(notificationCheckInterval.value);
    }

    if (isLoggedIn.value) {
        profile.value = await connect.getProfile();
        notifications.value = await connect.getNotifications();
        notificationCheckInterval.value = setInterval(async () => {
            notifications.value = await connect.getNotifications();
        }, 10_000);
    } else {
        profile.value = null;
        notifications.value = [];
    }
}

function handleUpload() {
    externalApi.openUrl("https://spinsha.re/upload");
}

function handleLogout() {
    connect.logout();
    mitt.emit('auth-updated');
}

async function handleNotificationClick(notification) {
    await connect.clearNotification(notification.id);

    switch(notification.notificationType) {
        case NOTIFICATION_TYPE_NEWREVIEW:
            router.push(`/chart/${notification.connectedSong.id}/reviews`);
            break;
        case NOTIFICATION_TYPE_NEWSPINPLAY:
            router.push(`/chart/${notification.connectedSong.id}/spinplays`);
            break;
        case NOTIFICATION_TYPE_RECEIVEDCARD:
            router.push(`/user/${notification.user.id}`);
            break;
    }

    notifications.value = await connect.getNotifications();
    connectNotificationPopupOpen.value = false;
}

async function handleNotificationClearAll() {
    await connect.clearAllNotifications();
    notifications.value = await connect.getNotifications();
    connectNotificationPopupOpen.value = false;
}
</script>

<style scoped>
.auth-area {
    @apply relative flex gap-2 items-center;

    & .profile-button {
        @apply w-8 h-8 rounded-full bg-cover bg-center transition-all cursor-pointer ml-2;

        &:hover {
            @apply opacity-60;
        }
    }
    & .connect-notification-popup {
        @apply absolute top-10 right-10 z-10 w-[400px] bg-base-200 dark:bg-base-900 rounded-md shadow-2xl block overflow-hidden;

        & header {
            @apply flex items-center px-4 py-2;

            & h1 {
                @apply font-bold grow;
            }
        }

        & .notifications {
            @apply flex flex-col max-h-[500px] overflow-hidden overflow-y-auto;

            & .item {
                @apply transition-all grid grid-cols-[32px_1fr] align-top gap-4 p-4 border-t border-base-300 dark:border-base-800 text-left;

                & span {
                    @apply bg-brand-700 text-brand-200 w-[32px] h-[32px] rounded-full flex items-center justify-center;
                }

                & .chart-icon, & .card-icon {
                    @apply bg-cover bg-center w-[32px] h-[32px] rounded-sm;
                }

                & p {
                    @apply line-clamp-3 text-base-700 dark:text-base-300;

                    & strong {
                        @apply text-base-900 dark:text-base-50;
                    }
                }

                &:hover {
                    @apply bg-base-300 dark:bg-base-800 cursor-pointer;
                }
            }
        }
    }
    & .connect-profile-popup {
        @apply absolute top-10 right-0 z-10 w-[300px] bg-base-200 dark:bg-base-900 rounded-md shadow-2xl block overflow-hidden;

        & header {
            @apply flex items-center px-4 py-2;

            & .content {
                @apply flex grow flex-col;

                & .username {
                    @apply font-bold flex gap-1 items-center;

                    & span {
                        @apply line-clamp-1;
                    }
                }
                & .pronouns {
                    @apply text-sm text-base-600 dark:text-base-300 mt-[-3px] line-clamp-1;
                }
            }

            & .flags {
                @apply flex gap-1 items-center;

                & .badge-supporter {
                    @apply text-sm px-2 py-0.25 rounded-full bg-rose-800 text-rose-100 flex gap-1 items-center;
                }
                & .badge-verified {
                    @apply text-sm px-2 py-0.25 rounded-full bg-emerald-800 text-emerald-100 flex gap-1 items-center;
                }
            }
        }

        & nav {
            @apply border-t border-base-300 dark:border-base-800 flex flex-col;

            & .item {
                @apply h-[45px] transition-all flex items-center gap-2 px-4;

                &:hover {
                    @apply bg-base-300 dark:bg-base-800 cursor-pointer;
                }
            }
        }
    }
}
</style>
