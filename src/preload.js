// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
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
});

contextBridge.exposeInMainWorld('externalApi', {
    openUrl: async (url) => ipcRenderer.invoke('open-url', url),
    openFolder: async (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
});
