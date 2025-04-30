import { EventEmitter } from 'events';

export const STATE_PENDING = 0;
export const STATE_DOWNLOADING = 1;
export const STATE_IMPORTING = 2;
export const STATE_DONE = 3;
export const STATE_ERROR = 4;

/**
 * Represents a queue for managing and processing download items sequentially.
 */
export class DownloadQueue extends EventEmitter {
    constructor(apiClient, settingsManager, tempFolderPath) {
        super();

        console.log('[DownloadQueue] Ready.');
        this.items = [];
        this.workerActive = false;
        this.apiClient = apiClient;
        this.settingsManager = settingsManager;
        this.tempFolderPath = tempFolderPath;
    }

    /**
     * @param {DownloadItem} item
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

                // TODO: Download
                console.log('TODO: Download');
                await this.delay(2000);

                // EXTRACT, IMPORT, CACHE
                nextItem.state = STATE_IMPORTING;
                this.emit('item-change', nextItem);

                // TODO: Extract
                console.log('TODO: Extract');
                await this.delay(500);

                // TODO: Import
                console.log('TODO: Import');
                await this.delay(500);

                // TODO: Cache
                console.log('TODO: Create Cache');
                await this.delay(1000);

                nextItem.state = STATE_DONE;
                this.emit('item-change', nextItem);
            } catch (e) {
                console.error(e.message);
                nextItem.state = STATE_ERROR;
                this.emit('item-change', nextItem);
            }
        }

        this.workerActive = false;
        console.log('[DownloadQueue] Queue finished.');
        this.emit('queue-done');
        this.emit('queue-count-change', this.pendingItemsCount());
        this.emit('queue-change', this.items);
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
