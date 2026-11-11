import { inject, reactive } from 'vue';
import { NOTIFICATION_TYPE_NEWREVIEW, NOTIFICATION_TYPE_NEWSPINPLAY, NOTIFICATION_TYPE_RECEIVEDCARD } from '@spinshare/api-js';

/*
 * Shared SpinShare Connect account state
 */
const account = reactive({
    isLoggedIn: false,
    // true until the first check finished
    loading: true,
    profile: null,
    notifications: [],
});

let connect = null;
let mitt = null;
let notificationInterval = null;

async function refresh() {
    account.isLoggedIn = await connect.isLoggedIn();
    clearInterval(notificationInterval);

    if (account.isLoggedIn) {
        account.profile = await connect.getProfile();
        account.notifications = await connect.getNotifications();
        notificationInterval = setInterval(refreshNotifications, 30 * 60 * 1000);
    } else {
        account.profile = null;
        account.notifications = [];
    }
    account.loading = false;
}

async function refreshNotifications() {
    account.notifications = await connect.getNotifications();
}

async function clearNotification(id) {
    await connect.clearNotification(id);
    await refreshNotifications();
}

async function clearAllNotifications() {
    await connect.clearAllNotifications();
    await refreshNotifications();
}

function logout() {
    connect.logout();
    mitt.emit('auth-updated');
}

export function notificationTarget(notification) {
    switch (notification.notificationType) {
        case NOTIFICATION_TYPE_NEWREVIEW:
            return `/chart/${notification.connectedSong.id}/reviews`;
        case NOTIFICATION_TYPE_NEWSPINPLAY:
            return `/chart/${notification.connectedSong.id}/spinplays`;
        case NOTIFICATION_TYPE_RECEIVEDCARD:
            return `/user/${notification.user.id}`;
        default:
            return null;
    }
}

export function useAccount() {
    if (!connect) {
        connect = inject('connect');
        mitt = inject('mitt');
        mitt.on('auth-updated', refresh);
        refresh();
    }
    return { account, refresh, refreshNotifications, clearNotification, clearAllNotifications, logout };
}
