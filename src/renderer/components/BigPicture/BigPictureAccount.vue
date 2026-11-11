<template>
    <RouterLink
        v-if="!account.isLoggedIn && !account.loading"
        to="/connect/login"
        class="account-pill login"
        v-interactable
    >
        <Remixicon icon="key" />
        <span>{{ $t('header.auth.login') }}</span>
    </RouterLink>
    <button
        v-else-if="account.profile"
        :class="['account-pill', { open: gamepadState.accountOpen }]"
        @click="toggle"
        v-interactable
    >
        <img
            class="avatar"
            :src="account.profile.avatar"
            alt=""
        />
        <span class="username">{{ account.profile.username }}</span>
        <span
            v-if="account.notifications.length"
            class="notification-count"
        >
            <Remixicon
                icon="notification"
                size="sm"
                :filled="true"
            />
            {{ account.notifications.length }}
        </span>
    </button>
    <Loader
        v-else
        :size="24"
        :border-width="4"
    />

    <Teleport to="#app">
        <transition name="bp-fade">
            <div
                v-if="gamepadState.accountOpen"
                class="bp-card-backdrop"
                @click="close"
            ></div>
        </transition>
        <transition name="bp-slide-right">
            <aside
                v-if="gamepadState.accountOpen && account.profile"
                class="bp-card bp-account-panel"
                data-nav-scope
                @nav-back.prevent="close"
            >
                <header>
                    <img
                        class="avatar"
                        :src="account.profile.avatar"
                        alt=""
                    />
                    <div class="identity">
                        <span class="username">@{{ account.profile.username }}</span>
                        <span
                            v-if="account.profile.pronouns"
                            class="pronouns"
                            >{{ account.profile.pronouns }}</span
                        >
                        <div
                            v-if="account.profile.isPatreon || account.profile.isVerified"
                            class="flags"
                        >
                            <span
                                v-if="account.profile.isPatreon"
                                class="badge-supporter"
                            >
                                <Remixicon
                                    icon="heart"
                                    size="sm"
                                    :filled="true"
                                />
                            </span>
                            <span
                                v-if="account.profile.isVerified"
                                class="badge-verified"
                            >
                                <Remixicon
                                    icon="check"
                                    size="sm"
                                />
                            </span>
                        </div>
                    </div>
                </header>

                <nav>
                    <RouterLink
                        v-for="(link, index) in profileLinks"
                        :key="link.to"
                        :to="link.to"
                        :class="['bp-menu-item', { active: route.path === link.to }]"
                        :data-nav-autofocus="index === 0 ? '' : null"
                        @click="close"
                        v-interactable
                    >
                        <Remixicon
                            :icon="link.icon"
                            size="xl"
                        />
                        <span class="label">{{ $t(link.label) }}</span>
                    </RouterLink>
                </nav>

                <nav class="secondary">
                    <button
                        :class="['bp-menu-item', { active: notificationsOpen }]"
                        @click="notificationsOpen = !notificationsOpen"
                        v-interactable
                    >
                        <Remixicon
                            icon="notification"
                            size="xl"
                            :filled="notificationsOpen"
                        />
                        <span class="label">{{ $t('header.auth.notifications.header') }}</span>
                        <span
                            v-if="account.notifications.length"
                            class="count"
                            >{{ account.notifications.length }}</span
                        >
                    </button>
                    <button
                        class="bp-menu-item"
                        @click="handleUpload"
                        v-interactable
                    >
                        <Remixicon
                            icon="upload"
                            size="xl"
                        />
                        <span class="label">{{ $t('header.auth.upload') }}</span>
                        <Remixicon
                            icon="external-link"
                            class="opacity-60"
                        />
                    </button>
                    <button
                        class="bp-menu-item"
                        @click="handleLogout"
                        v-interactable
                    >
                        <Remixicon
                            icon="door-open"
                            size="xl"
                        />
                        <span class="label">{{ $t('header.auth.logout') }}</span>
                    </button>
                </nav>
            </aside>
        </transition>
        <transition name="bp-slide-right">
            <section
                v-if="gamepadState.accountOpen && notificationsOpen"
                class="bp-card bp-notifications"
                :data-nav-scope="account.notifications.length ? '' : null"
                @nav-back.prevent="notificationsOpen = false"
            >
                <header>
                    <h1>{{ $t('header.auth.notifications.header') }}</h1>
                    <button
                        v-if="account.notifications.length"
                        class="button ghost"
                        @click="clearAllNotifications"
                        v-interactable
                    >
                        <Remixicon icon="delete-bin" />
                        <span>{{ $t('bigPicture.account.clearAll') }}</span>
                    </button>
                </header>
                <div class="list">
                    <EmptyState
                        v-if="account.notifications.length === 0"
                        :label="$t('header.auth.notifications.noNotifications')"
                        icon="notification"
                    />
                    <button
                        v-for="(notification, index) in account.notifications"
                        :key="notification.id"
                        class="notification"
                        :data-nav-autofocus="index === 0 ? '' : null"
                        @click="handleNotificationClick(notification)"
                        v-interactable
                    >
                        <template v-if="notification.notificationType === NOTIFICATION_TYPE_SYSTEM">
                            <span class="icon-system">
                                <Remixicon icon="megaphone" />
                            </span>
                            <p>{{ notification.notificationData }}</p>
                        </template>
                        <template v-if="notification.notificationType === NOTIFICATION_TYPE_NEWREVIEW">
                            <span
                                class="cover"
                                :style="`background-image: url(${notification.connectedSong.cover})`"
                            ></span>
                            <p>{{ $t('header.auth.notifications.newReview', { username: notification.connectedUser.username, title: notification.connectedSong.title }) }}</p>
                        </template>
                        <template v-if="notification.notificationType === NOTIFICATION_TYPE_NEWSPINPLAY">
                            <span
                                class="cover"
                                :style="`background-image: url(${notification.connectedSong.cover})`"
                            ></span>
                            <p>{{ $t('header.auth.notifications.newSpinPlay', { username: notification.connectedUser.username, title: notification.connectedSong.title }) }}</p>
                        </template>
                        <template v-if="notification.notificationType === NOTIFICATION_TYPE_RECEIVEDCARD">
                            <span
                                class="cover"
                                :style="`background-image: url(${notification.connectedCard.icon})`"
                            ></span>
                            <p>{{ $t('header.auth.notifications.receivedCard', { card: notification.connectedCard.title }) }}</p>
                        </template>
                    </button>
                </div>
            </section>
        </transition>
    </Teleport>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NOTIFICATION_TYPE_NEWREVIEW, NOTIFICATION_TYPE_NEWSPINPLAY, NOTIFICATION_TYPE_RECEIVEDCARD, NOTIFICATION_TYPE_SYSTEM } from '@spinshare/api-js';
import Remixicon from '@/components/Remixicon.vue';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { gamepadState } from '@/modules/gamepad/state';
import { notificationTarget, useAccount } from '@/modules/account';

const externalApi = inject('externalApi');
const navigation = inject('navigation');
const route = useRoute();
const router = useRouter();
const { account, clearNotification, clearAllNotifications, logout } = useAccount();
const notificationsOpen = ref(false);

const profileLinks = computed(() => {
    const id = account.profile?.id;
    return [
        { to: `/user/${id}`, label: 'header.auth.profile', icon: 'user' },
        { to: `/user/${id}/charts`, label: 'header.auth.charts', icon: 'music-2' },
        { to: `/user/${id}/reviews`, label: 'header.auth.reviews', icon: 'award' },
        { to: `/user/${id}/playlists`, label: 'header.auth.playlists', icon: 'album' },
        { to: `/user/${id}/spinplays`, label: 'header.auth.spinPlays', icon: 'youtube' },
    ];
});

function toggle() {
    gamepadState.accountOpen = !gamepadState.accountOpen;
    // Move the focus into the panel (or back out of it)
    setTimeout(() => navigation.ensureFocus(), 50);
}

function close() {
    gamepadState.accountOpen = false;
}

watch(
    () => gamepadState.accountOpen,
    (open) => {
        if (!open) notificationsOpen.value = false;
    },
);

watch(
    () => route.fullPath,
    () => close(),
);

function handleUpload() {
    externalApi.openUrl('https://spinsha.re/upload');
}

function handleLogout() {
    close();
    logout();
}

async function handleNotificationClick(notification) {
    const target = notificationTarget(notification);
    if (target) {
        close();
        router.push(target);
    }
    await clearNotification(notification.id);
}
</script>

<style scoped>
.account-pill {
    @apply flex items-center gap-2 h-[48px] pl-2 pr-4 rounded cursor-pointer transition-colors;
    @apply bg-base-200/80 text-base-800 dark:bg-base-900/80 dark:text-base-100 border border-base-300 dark:border-base-800;

    &:hover,
    &.open {
        @apply bg-base-300 dark:bg-base-800;
    }
    &.login {
        @apply pl-4 bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50 border-transparent font-semibold;

        &:hover {
            @apply bg-brand-300 dark:bg-brand-600;
        }
    }

    & .avatar {
        @apply w-8 h-8 rounded-full object-cover;
    }
    & .username {
        @apply font-semibold max-w-[140px] truncate;
    }
    & .notification-count {
        @apply flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-md bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50;
    }
}

.bp-account-panel {
    @apply right-4 w-[340px] gap-2 p-4 overflow-y-auto;
    scrollbar-width: none;

    & header {
        @apply flex items-center gap-4 px-2 pt-2 pb-4;

        & .avatar {
            @apply w-16 h-16 rounded-full object-cover shrink-0;
        }
        & .identity {
            @apply flex flex-col min-w-0;

            & .username {
                @apply text-lg font-bold truncate;
            }
            & .pronouns {
                @apply text-sm text-base-600 dark:text-base-300 truncate;
            }
            & .flags {
                @apply flex gap-1 mt-1;

                & .badge-supporter {
                    @apply px-2 py-0.5 rounded-full bg-rose-800 text-rose-100 flex items-center;
                }
                & .badge-verified {
                    @apply px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 flex items-center;
                }
            }
        }
    }

    & nav {
        @apply flex flex-col gap-1;

        &.secondary {
            @apply mt-auto pt-3 border-t border-base-200 dark:border-base-800;
        }
    }
}

.bp-notifications {
    @apply right-[372px] w-[460px];

    & header {
        @apply flex items-center justify-between gap-2 p-6 pb-0;

        & h1 {
            @apply text-xl font-bold;
        }
    }
    & .list {
        @apply flex flex-col gap-2 overflow-y-auto px-5 pt-3 pb-5;
        scrollbar-width: none;
    }
    & .notification {
        @apply grid grid-cols-[48px_1fr] items-center gap-4 p-3 rounded text-left transition-colors cursor-pointer;

        &:hover {
            @apply bg-base-200 dark:bg-base-900;
        }
        & .cover {
            @apply w-12 h-12 rounded-md bg-cover bg-center;
        }
        & .icon-system {
            @apply w-12 h-12 rounded-full flex items-center justify-center bg-brand-400 text-brand-950 dark:bg-brand-700 dark:text-brand-50;
        }
        & p {
            @apply line-clamp-3 text-base-700 dark:text-base-200 leading-6;
        }
    }
}
</style>
