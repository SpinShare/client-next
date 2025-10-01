import { ipcMain } from 'electron';

export function setupPromosApiHandlers(apiClient) {
    ipcMain.handle('get-promos', async () => {
        try {
            return await apiClient.getActivePromos();
        } catch (e) {
            console.error(e.message);
            return [];
        }
    });
}
