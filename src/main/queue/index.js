export const STATE_PENDING = 0;
export const STATE_DOWNLOADING = 1;
export const STATE_IMPORTING = 2;
export const STATE_DONE = 3;
export const STATE_ERROR = 3;

export class DownloadQueue {
    constructor() {
        this.items = [];
        this.workerActive = false;
    }

    addItem(item) {
        this.items.push({ ...item, state: STATE_PENDING });
        this.startWorker();
    }

    removeItem(id) {
        this.items = this.items.filter((item) => item.id !== id);
    }

    hasPendingItems() {
        return this.items.some((item) => item.state !== STATE_DONE);
    }

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
                // TODO: Download
                nextItem.state = STATE_DOWNLOADING;
                console.log('TODO: Download');

                await this.delay(2000);

                // TODO: Extract
                nextItem.state = STATE_IMPORTING;
                console.log('TODO: Extract');
                console.log('TODO: Import');

                await this.delay(1000);
            } catch (e) {
                console.error(e.message);
                nextItem.state = STATE_ERROR;
            }
        }

        this.workerActive = false;
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
