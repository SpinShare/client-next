import { EventEmitter } from 'events';
import fs from 'node:fs';
import path from 'node:path';
import * as crypto from 'node:crypto';
import { CacheItem } from './cacheItem';
import { app } from 'electron';
import { Jimp } from 'jimp';

/**
 * Represents a chart library with a cache for installed charts
 */
export class LibraryManager extends EventEmitter {
    /**
     * @param {Object} apiClient
     * @param {Object} settingsManager
     *
     * @return {void}
     */
    constructor(apiClient, settingsManager) {
        super();

        this.items = [];
        this.apiClient = apiClient;
        this.settingsManager = settingsManager;
        this.chartsPath = this.settingsManager.get('pathCustoms');
        this.cachePath = path.join(app.getPath('userData'), 'SpinShare', 'cache');
        this.cacheFilePath = path.join(app.getPath('userData'), 'SpinShare', 'cache', 'cache.json');
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
        if (!fs.existsSync(this.cacheFilePath)) {
            this.save();
        }

        console.log('[Library] Ready.');

        this.load();
    }

    /**
     * Revalidates the library cache by removing all png files in the cachePath and re-adding all srtb files in the chartsPath
     *
     * @returns {void}
     */
    async rebuild() {
        this.items = [];
        this.emit('cache-rebuild-start');

        // Remove cached cover files
        const cacheCoverFiles = await fs.promises.readdir(this.cachePath);
        for (const file of cacheCoverFiles) {
            if (file.endsWith('.png')) {
                await fs.promises.rm(path.join(this.cachePath, file));
            }
        }

        // Add all charts
        const chartFiles = await fs.promises.readdir(this.chartsPath);
        let chartsToCache = chartFiles.length;
        for (const [i, file] of chartFiles.entries()) {
            if (file.endsWith('.srtb')) {
                const chartPath = path.join(this.chartsPath, file);
                await this.add(chartPath, false);
            }

            this.emit('cache-rebuild-progress', {
                total: chartsToCache,
                current: i,
                percent: Math.round((i / chartsToCache) * 100),
            });
        }

        this.save();
        this.emit('cache-change');
        this.emit('cache-rebuild-progress', {
            total: chartsToCache,
            current: chartsToCache,
            percent: 100,
        });
        this.emit('cache-rebuild-done');
    }

    /**
     * Adds a chart to the cache. Also does necessary caching and creates a thumbnail
     * @param chartPath
     * @param autoSave
     * @returns {Promise<void>}
     */
    async add(chartPath, autoSave = true) {
        if (!fs.existsSync(chartPath)) {
            return;
        }

        const chartId = path.basename(chartPath).replace('.srtb', '');

        const chartSrtbRaw = await fs.promises.readFile(chartPath, 'utf-8');
        const chartSrtbJson = JSON.parse(chartSrtbRaw);
        const { cacheItem, albumArtReference } = CacheItem.fromSrtb(chartSrtbJson);

        cacheItem.srtbPath = path.basename(chartPath);
        cacheItem.fileReference = chartId;
        // Create an update hash in the same way the server does
        cacheItem.updateHash = crypto.createHash('md5').update(chartSrtbRaw).digest('hex');

        // Create thumbnail
        if (albumArtReference) {
            console.log(`[Library] (${chartId}) Generating thumbnail.`);

            const albumArtFolderPath = path.join(this.chartsPath, 'AlbumArt');
            const albumArts = await fs.promises.readdir(albumArtFolderPath);
            const albumArtFilename = albumArts.find((file) => file.includes(albumArtReference));

            if (albumArtFilename) {
                const albumArtPath = path.join(albumArtFolderPath, albumArtFilename);
                const cacheAlbumArtPath = path.join(this.cachePath, `${chartId}.png`);
                try {
                    await this.generateThumbnail(albumArtPath, cacheAlbumArtPath);
                } catch (e) {
                    console.error(`[Library] (${chartId}) Failed to generate thumbnail: ${e.message}]`);
                }
            }
        }

        // Either update or add chart to cache
        if (this.items.some((item) => item.fileReference === chartId)) {
            console.log(`[Library] (${chartId}) Updating Cache.`);
            this.items = this.items.filter((item) => item.fileReference !== chartId);
        } else {
            console.log(`[Library] (${chartId}) Adding to Cache.`);
        }

        this.items.push(cacheItem);
        console.log(`[Library] (${chartId}) Added to cache. UpdateHash: ${cacheItem.updateHash}`);

        if (autoSave) {
            this.save();
            this.emit('cache-change');
        }
    }

    /**
     * Generates a 128x128 png of the chartCoverPath and saves it to cacheCoverPath with the same filename as the chartCoverPath
     *
     * @param chartCoverPath
     * @param cacheCoverPath
     */
    async generateThumbnail(chartCoverPath, cacheCoverPath) {
        const image = await Jimp.read(chartCoverPath);
        image.resize({ w: 128, h: 128 });
        await image.write(cacheCoverPath);
    }

    /**
     * Removes a chart from the library cache
     * @param chartId
     * @param autoSave
     * @returns {Promise<void>}
     */
    async remove(chartId, autoSave = true) {
        await fs.promises.rm(path.join(this.cachePath, `${chartId}.png`));

        this.items = this.items.filter((item) => item.id !== chartId);

        if (autoSave) {
            this.save();
            this.emit('cache-change');
        }
    }

    /**
     * Saves the chart library cache
     */
    save() {
        console.log(`[Library] Saving cache`);
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.items), 'utf-8');
    }

    /**
     * Loads the chart library cache
     */
    load() {
        console.log(`[Library] Loading cache`);
        const loadedItems = JSON.parse(fs.readFileSync(this.cacheFilePath, 'utf-8'));
        this.items = [...loadedItems];
        this.emit('cache-change');
        console.log(`[Library] Cache loaded.`);
    }

    /**
     * Returns a chart if in cache
     * @param fileReference
     * @returns {*}
     */
    get(fileReference) {
        return this.items.find((item) => item?.fileReference === fileReference);
    }

    /**
     * Returns the updateHash of a chart
     * @param fileReference
     * @returns {*|null}
     */
    getUpdateHash(fileReference) {
        const item = this.get(fileReference);
        if (!item) {
            return null;
        }

        return item.updateHash;
    }

    /**
     * Returns a base64 string of a charts thumbnail
     * @param fileReference
     * @returns {Promise<string|null>}
     */
    async getThumbnailAsBase64(fileReference) {
        const cacheCoverPath = path.join(this.cachePath, `${fileReference}.png`);
        if (!fs.existsSync(cacheCoverPath)) {
            return null;
        }

        return await fs.promises.readFile(cacheCoverPath, { encoding: 'base64' });
    }
}
