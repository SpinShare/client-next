import { ipcMain } from 'electron';

export function setupChartsApiHandlers(apiClient) {
    ipcMain.handle('get-chart', async (event, chartIdOrReference) => {
        try {
            return await apiClient.getChartDetail(chartIdOrReference);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
}
