// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('spshApi', {
    getClientLatestVersion: async () => ipcRenderer.invoke('get-client-latest-version'),
    getPromos: async () => ipcRenderer.invoke('get-promos'),
    getChartDetail: async (chartIdOrReference) => ipcRenderer.invoke('get-chart-detail', chartIdOrReference),
    getChartReviews: async (chartIdOrReference) => ipcRenderer.invoke('get-chart-reviews', chartIdOrReference),
    getChartPlaylists: async (chartIdOrReference) => ipcRenderer.invoke('get-chart-playlists', chartIdOrReference),
    getChartSpinPlays: async (chartIdOrReference) => ipcRenderer.invoke('get-chart-spinplays', chartIdOrReference),
    getChartDownload: async (chartIdOrReference) => ipcRenderer.invoke('get-chart-download', chartIdOrReference),
    getPlaylist: async (playlistId) => ipcRenderer.invoke('get-playlist', playlistId),
    getNewCharts: async (page) => ipcRenderer.invoke('get-new-charts', page),
    getUpdatedCharts: async (page) => ipcRenderer.invoke('get-updated-charts', page),
    getHotThisWeekCharts: async (page) => ipcRenderer.invoke('get-hot-this-week-charts', page),
    getHotThisMonthCharts: async (page) => ipcRenderer.invoke('get-hot-this-month-charts', page),
    getUserDetail: async (userId) => ipcRenderer.invoke('get-user-detail', userId),
    getUserCharts: async (userId) => ipcRenderer.invoke('get-user-charts', userId),
    getUserReviews: async (userId) => ipcRenderer.invoke('get-user-reviews', userId),
    getUserPlaylists: async (userId) => ipcRenderer.invoke('get-user-playlists', userId),
    getUserSpinPlays: async (userId) => ipcRenderer.invoke('get-user-spinplays', userId),
    searchCharts: async (query, options) => ipcRenderer.invoke('search-charts', query, options),
    searchPlaylists: async (query) => ipcRenderer.invoke('search-playlists', query),
    searchUsers: async (query) => ipcRenderer.invoke('search-users', query),
});

contextBridge.exposeInMainWorld('spshQueue', {
    addQueueItem: async (item) => ipcRenderer.invoke('add-queue-item', item),
    removeQueueItem: async (itemId) => ipcRenderer.invoke('remove-queue-item', itemId),
    clearQueueDone: async () => ipcRenderer.invoke('clear-queue-done'),
    getQueueItems: async () => ipcRenderer.invoke('get-queue-items'),
    getQueueCount: async () => ipcRenderer.invoke('get-queue-count'),
    onQueueChange: (callback) => {
        const listener = (_, queueItems) => callback(queueItems);
        ipcRenderer.on('queue-change', listener);
        return () => ipcRenderer.removeListener('queue-change', listener);
    },
    onQueueCountChange: (callback) => {
        const listener = (_, queueCount) => callback(queueCount);
        ipcRenderer.on('queue-count-change', listener);
        return () => ipcRenderer.removeListener('queue-count-change', listener);
    },
    onItemChange: (callback) => {
        const listener = (_, queueItem) => callback(queueItem);
        ipcRenderer.on('item-change', listener);
        return () => ipcRenderer.removeListener('item-change', listener);
    },
    onItemAdd: (callback) => {
        const listener = (_, queueItem) => callback(queueItem);
        ipcRenderer.on('item-add', listener);
        return () => ipcRenderer.removeListener('item-add', listener);
    },
    onQueueDone: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('queue-done', listener);
        return () => ipcRenderer.removeListener('queue-done', listener);
    },
});

contextBridge.exposeInMainWorld('spshSettings', {
    getAll: () => ipcRenderer.invoke('get-settings-all'),
    get: (key) => ipcRenderer.invoke('get-settings', key),
    set: (key, value) => ipcRenderer.invoke('set-settings', key, value),
    resetAll: () => ipcRenderer.invoke('reset-settings-all'),
    reset: (key) => ipcRenderer.invoke('reset-settings', key),
    saveAll: (settings) => ipcRenderer.invoke('save-settings-all', settings),
    load: () => ipcRenderer.invoke('load-settings'),
    getDefaultCustomsPath: () => ipcRenderer.invoke('get-default-customs-path'),
});

contextBridge.exposeInMainWorld('spshLibrary', {
    rebuild: () => ipcRenderer.invoke('rebuild-library'),
    getAll: () => ipcRenderer.invoke('get-library-all'),
    get: (fileReference) => ipcRenderer.invoke('get-library', fileReference),
    getThumbnail: (fileReference) => ipcRenderer.invoke('get-library-thumbnail', fileReference),
    getUpdateHash: (fileReference) => ipcRenderer.invoke('get-library-update-hash', fileReference),
    onCacheChange: (callback) => {
        const listener = (_, items) => callback(items);
        ipcRenderer.on('cache-change', listener);
        return () => ipcRenderer.removeListener('cache-change', listener);
    },
    onCacheRebuildStart: (callback) => {
        const listener = (_) => callback();
        ipcRenderer.on('cache-rebuild-start', listener);
        return () => ipcRenderer.removeListener('cache-rebuild-start', listener);
    },
    onCacheRebuildProgress: (callback) => {
        const listener = (_, status) => callback(status);
        ipcRenderer.on('cache-rebuild-progress', listener);
        return () => ipcRenderer.removeListener('cache-rebuild-progress', listener);
    },
    onCacheRebuildDone: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('cache-rebuild-done', listener);
        return () => ipcRenderer.removeListener('cache-rebuild-done', listener);
    },
});

contextBridge.exposeInMainWorld('spshUpdates', {
    checkForUpdates: async () => ipcRenderer.invoke('check-for-updates'),
    onUpdateCheckDone: (callback) => {
        const listener = (_, updates) => callback(updates);
        ipcRenderer.on('update-check-done', listener);
        return () => ipcRenderer.removeListener('update-check-done', listener);
    },
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});

contextBridge.exposeInMainWorld('spshConnect', {
    validateToken: async () => ipcRenderer.invoke('connect-validate-token'),
    isLoggedIn: () => ipcRenderer.invoke('connect-is-logged-in'),
    getProfile: async () => ipcRenderer.invoke('connect-get-profile'),
    getPlaylists: async () => ipcRenderer.invoke('connect-get-playlists'),
    getNotifications: async () => ipcRenderer.invoke('connect-get-notifications'),
    clearNotification: async (notificationId) => ipcRenderer.invoke('connect-clear-notification', notificationId),
    clearAllNotifications: async () => ipcRenderer.invoke('connect-clear-all-notifications'),
    getReview: async (chartId) => ipcRenderer.invoke('connect-get-review', chartId),
    addReview: async (chartId, recommended, comment) => ipcRenderer.invoke('connect-add-review', chartId, recommended, comment),
    removeReview: async (chartId) => ipcRenderer.invoke('connect-remove-review', chartId),
    login: async (connectCode) => ipcRenderer.invoke('connect-login', connectCode),
    logout: async () => ipcRenderer.invoke('connect-logout'),
});

contextBridge.exposeInMainWorld('spshExternalApi', {
    openUrl: async (url) => ipcRenderer.invoke('open-url', url),
    openFolder: async (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
    selectFolder: async (folderPath) => ipcRenderer.invoke('select-folder', folderPath),
    copyText: async (text) => ipcRenderer.invoke('copy-text', text),
    onWindowFocused: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('window-focused', listener);
        return () => ipcRenderer.removeListener('window-focused', listener);
    },
    onWindowBlurred: (callback) => {
        const listener = () => callback();
        ipcRenderer.on('window-blurred', listener);
        return () => ipcRenderer.removeListener('window-blurred', listener);
    },
});

contextBridge.exposeInMainWorld('spshDeepLink', {
    onNavigateTo: (callback) => {
        const listener = (_, route) => callback(route);
        ipcRenderer.on('navigate-to', listener);
        return () => ipcRenderer.removeListener('navigate-to', listener);
    },
});
