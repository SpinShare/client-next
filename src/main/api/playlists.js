import { ipcMain } from 'electron';

export function setupPlaylistsApiHandlers(apiClient) {
    ipcMain.handle('get-playlist', async (event, playlistId) => {
        try {
            return await apiClient.getPlaylistDetail(playlistId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
}
