// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

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
    getQueueHasItems: async () => ipcRenderer.invoke('get-queue-hasitems'),
    addQueueItem: async (item) => ipcRenderer.invoke('add-queue-item', item),
    removeQueueItem: async (itemId) => ipcRenderer.invoke('remove-queue-item', itemId),
});

contextBridge.exposeInMainWorld('spshSettings', {
    getAll: () => ipcRenderer.invoke('get-settings-all'),
    get: (key) => ipcRenderer.invoke('get-settings', key),
    set: (key, value) => ipcRenderer.invoke('set-settings', key, value),
    resetAll: () => ipcRenderer.invoke('reset-settings-all'),
    reset: (key) => ipcRenderer.invoke('reset-settings', key),
    save: () => ipcRenderer.invoke('save-settings'),
    load: () => ipcRenderer.invoke('load-settings'),
    getDefaultCustomsPath: () => ipcRenderer.invoke('get-default-customs-path'),
});

contextBridge.exposeInMainWorld('spshConnect', {
    validateToken: async () => ipcRenderer.invoke('connect-validate-token'),
    isLoggedIn: () => ipcRenderer.invoke('connect-is-logged-in'),
    getProfile: async () => ipcRenderer.invoke('connect-get-profile'),
    login: async (connectCode) => ipcRenderer.invoke('connect-login', connectCode),
    logout: async () => ipcRenderer.invoke('connect-logout'),
});

contextBridge.exposeInMainWorld('spshExternalApi', {
    openUrl: async (url) => ipcRenderer.invoke('open-url', url),
    openFolder: async (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
});
