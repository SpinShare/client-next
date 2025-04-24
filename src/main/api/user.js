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
}
