import { ipcMain } from 'electron';

export function setupClientApiHandlers(apiClient) {
    ipcMain.handle('get-client-latest-version', async (event) => {
        try {
            return await apiClient.getClientLatestVersion();
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
}
