import { DownloadItem } from '../queue/downloadQueueItem';
import { STATE_DONE } from '../queue';

/**
 * Queues the selected room track when it is missing or out of date and the matching auto setting is enabled
 * @param {RoomSyncClient} roomSync
 * @param {SettingsManager} settingsManager
 * @param {LibraryManager} library
 * @param {DownloadQueue} downloadQueue
 * @param apiClient
 */
export function setupRoomSyncAutoDownload(roomSync, settingsManager, library, downloadQueue, apiClient) {
    async function handleTrack(track) {
        const fileReference = track?.fileReference;
        if (!track?.custom || !fileReference?.startsWith('spinshare_')) return;

        const cacheItem = library.get(fileReference);
        if (cacheItem ? !settingsManager.get('roomSyncAutoUpdate') : !settingsManager.get('roomSyncAutoDownload')) return;

        // Track messages repeat for the same chart (e.g. difficulty changes), skip charts that are already being handled
        if (downloadQueue.items.some((item) => item.fileReference === fileReference && item.state < STATE_DONE)) return;

        let chart;
        try {
            chart = await apiClient.getChartDetail(fileReference);
        } catch (e) {
            console.warn(`[RoomSyncAutoDownload] (${fileReference}) Failed to get chart: ${e.message}`);
            return;
        }
        if (!chart) return;
        if (cacheItem && cacheItem.updateHash === chart.updateHash) return;

        // The track may have changed while waiting for the API
        if (roomSync.track?.fileReference !== fileReference) return;

        console.log(`[RoomSyncAutoDownload] (${fileReference}) ${cacheItem ? 'Updating' : 'Downloading'} ${chart.title}`);
        downloadQueue.addItem(new DownloadItem(chart.id, chart.cover, chart.title, chart.artist, chart.charter, chart.fileReference, false));
    }

    roomSync.on('track-change', handleTrack);

    return {
        // Re-checks the current track, e.g. after an auto setting was enabled
        check: () => handleTrack(roomSync.track),
    };
}
