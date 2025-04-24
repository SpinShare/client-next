import { ipcMain } from 'electron';

export function setupUserApiHandlers(apiClient) {
    ipcMain.handle('get-user-detail', async (event, userId) => {
        try {
            return await apiClient.getUserDetail(userId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-user-charts', async (event, userId) => {
        try {
            return await apiClient.getUserCharts(userId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-user-playlists', async (event, userId) => {
        try {
            return await apiClient.getUserPlaylists(userId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-user-reviews', async (event, userId) => {
        try {
            return await apiClient.getUserReviews(userId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-user-spinplays', async (event, userId) => {
        try {
            return await apiClient.getUserSpinPlays(userId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
}
