import { ipcMain } from 'electron';

export function setupChartsApiHandlers(apiClient) {
    ipcMain.handle('get-chart-detail', async (event, chartIdOrReference) => {
        try {
            return await apiClient.getChartDetail(chartIdOrReference);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-chart-reviews', async (event, chartIdOrReference) => {
        try {
            return await apiClient.getChartReviews(chartIdOrReference);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-chart-playlists', async (event, chartIdOrReference) => {
        try {
            return await apiClient.getChartPlaylists(chartIdOrReference);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-chart-spinplays', async (event, chartIdOrReference) => {
        try {
            return await apiClient.getChartSpinPlays(chartIdOrReference);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
    ipcMain.handle('get-chart-download', async (event, chartIdOrReference) => {
        try {
            return await apiClient.getChartDownload(chartIdOrReference);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    });
}
