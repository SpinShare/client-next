import { ipcMain } from 'electron';

export function setupDiscoverApiHandlers(apiClient) {
    ipcMain.handle('get-new-charts', async (event, page) => {
        try {
            return await apiClient.getNewCharts(page);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-updated-charts', async (event, page) => {
        try {
            return await apiClient.getUpdatedCharts(page);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-hot-this-week-charts', async (event, page) => {
        try {
            return await apiClient.getHotThisWeekCharts(page);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-hot-this-month-charts', async (event, page) => {
        try {
            return await apiClient.getHotThisMonthCharts(page);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
}
