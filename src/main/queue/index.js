import { Notification } from 'electron';
import { EventEmitter } from 'events';
import fs from 'node:fs';
import path from 'node:path';
import unzip from 'unzip-stream';

export const STATE_PENDING = 0;
export const STATE_DOWNLOADING = 1;
export const STATE_IMPORTING = 2;
export const STATE_DONE = 3;
export const STATE_ERROR = 4;

/**
 * Represents a queue for managing and processing download items sequentially.
 */
export class DownloadQueue extends EventEmitter {
    /**
     * @param apiClient
     * @param {SettingsManager} settingsManager
     * @param {LibraryManager} libraryManager
     * @param tempFolderPath
     *
     * @return {void}
     */
    constructor(apiClient, settingsManager, libraryManager, tempFolderPath) {
        super();
        this.items = [];
        this.workerActive = false;
        this.apiClient = apiClient;
        this.settingsManager = settingsManager;
        this.libraryManager = libraryManager;
        this.tempFolderPath = path.join(tempFolderPath, 'SpinShare');

        fs.mkdirSync(this.tempFolderPath, { recursive: true });

        console.log('[DownloadQueue] Ready.');
    }

    /**
     * @param {DownloadItem} item
     *
     * @return {void}
     */
    addItem(item) {
        if (!this.isInQueue(item.id)) {
            console.log(`[DownloadQueue] Adding item ${item.id}`);
            this.items.push({ ...item, state: STATE_PENDING });

            console.log(`[DownloadQueue] Queue has ${this.pendingItemsCount()} items.`);
        }

        this.emit('queue-count-change', this.pendingItemsCount());
        this.emit('queue-change', this.items);

        this.startWorker();
    }

    /**
     * @param {string} id
     * @returns {boolean}
     */
    isInQueue(id) {
        return this.items.some((item) => item.id === id);
    }

    /**
     * @param {string} id
     *
     * @return {void}
     */
    removeItem(id) {
        this.items = this.items.filter((item) => item.id !== id);

        this.emit('queue-count-change', this.pendingItemsCount());
        this.emit('queue-change', this.items);
    }

    /**
     * @returns {boolean}
     */
    hasPendingItems() {
        return this.items.some((item) => item.state === STATE_PENDING);
    }

    pendingItemsCount() {
        return this.items.filter((item) => item.state === STATE_PENDING).length;
    }

    /**
     * @returns {Promise<void>}
     */
    async startWorker() {
        if (this.workerActive) {
            return;
        }

        const showNotifications = this.settingsManager.get('downloadNotifications');

        while (this.hasPendingItems()) {
            this.workerActive = true;
            const nextItem = this.items.find((item) => item.state === STATE_PENDING);

            if (!nextItem) {
                this.workerActive = false;
                continue;
            }

            try {
                // DOWNLOAD
                nextItem.state = STATE_DOWNLOADING;
                this.emit('item-change', nextItem);

                console.log(`[DownloadQueue] Download: (${nextItem.id}) ${nextItem.title}`);
                const chartZip = await this.apiClient.getChartDownload(nextItem.id);
                const chartZipPath = path.join(this.tempFolderPath, `${nextItem.id}.zip`);
                await fs.promises.writeFile(chartZipPath, chartZip);

                // EXTRACT, IMPORT, CACHE
                nextItem.state = STATE_IMPORTING;
                this.emit('item-change', nextItem);

                console.log(`[DownloadQueue] Extract: (${nextItem.id}) ${nextItem.title}`);
                const chartDestinationPath = this.settingsManager.get('pathCustoms');
                await new Promise((resolve, reject) => {
                    const chartZipReadStream = fs.createReadStream(chartZipPath);
                    chartZipReadStream.pipe(unzip.Extract({ path: chartDestinationPath }));
                    chartZipReadStream.on('end', () => {
                        resolve();
                    });
                    chartZipReadStream.on('error', () => {
                        reject();
                    });
                });

                // TODO: Cache
                console.log(`[DownloadQueue] Cache: (${nextItem.id}) ${nextItem.title}`);
                await this.libraryManager.add(path.join(chartDestinationPath, `${nextItem.fileReference}.srtb`));

                nextItem.state = STATE_DONE;
                this.emit('item-change', nextItem);

                if (showNotifications) {
                    new Notification({
                        title: `${nextItem.title}`,
                        body: 'Download complete',
                    }).show();
                }
            } catch (e) {
                console.error(e.message);
                nextItem.state = STATE_ERROR;
                this.emit('item-change', nextItem);

                if (showNotifications) {
                    new Notification({
                        title: `${nextItem.title}`,
                        body: 'Download failed',
                    }).show();
                }
            }

            console.log('--------------------');
        }

        this.workerActive = false;
        console.log('[DownloadQueue] Queue finished.');
        this.emit('queue-done');
        this.emit('queue-count-change', this.pendingItemsCount());
        this.emit('queue-change', this.items);

        if (showNotifications) {
            new Notification({
                title: `Queue finished`,
                body: 'All charts were downloaded or failed.',
            }).show();
        }
    }

    clearDone() {
        this.items = this.items.filter((item) => item.state !== STATE_DONE);
        this.emit('queue-count-change', this.pendingItemsCount());
        this.emit('queue-change', this.items);
    }

    // DEBUG
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
