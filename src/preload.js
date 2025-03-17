// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getPromos: async () => ipcRenderer.invoke('get-promos'),
    getChart: async (chartIdOrReference) => ipcRenderer.invoke('get-chart', chartIdOrReference),
    getPlaylist: async (playlistId) => ipcRenderer.invoke('get-playlist', playlistId),
});
