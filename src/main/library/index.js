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
        this.remoteHashesFilePath = path.join(app.getPath('userData'), 'SpinShare', 'cache', 'remoteHashes.json');
        this.remoteHashes = {};
        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }
        if (!fs.existsSync(this.cacheFilePath)) {
            this.save();
        }

        console.log('[Library] Ready.');

        this.load();
        this.loadRemoteHashes();
    }

    /**
     * Revalidates the library cache by removing all png files in the cachePath and re-adding all srtb files in the chartsPath
     *
     * @returns {void}
     */
    async rebuild() {
        this.items = [];
        this.remoteHashes = {};
        this.saveRemoteHashes();
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
                try {
                    await this.add(chartPath, false);
                } catch (e) {
                    console.error(`[Library] Failed to add chart to cache: ${e.message}`);
                }
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
        // Migrate items cached before the rename of hasExtremeDifficulty
        for (const item of loadedItems) {
            if (item && 'hasExtremeDifficulty' in item) {
                item.hasExpertDifficulty ??= item.hasExtremeDifficulty;
                delete item.hasExtremeDifficulty;
            }
        }
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
     * Loads the cached updateHashes of charts on SpinShare
     */
    loadRemoteHashes() {
        if (!fs.existsSync(this.remoteHashesFilePath)) {
            return;
        }

        try {
            this.remoteHashes = JSON.parse(fs.readFileSync(this.remoteHashesFilePath, 'utf-8'));
        } catch (e) {
            console.error(`[Library] Failed to load remote hashes: ${e.message}`);
            this.remoteHashes = {};
        }
    }

    /**
     * Saves the cached updateHashes of charts on SpinShare
     */
    saveRemoteHashes() {
        fs.writeFileSync(this.remoteHashesFilePath, JSON.stringify(this.remoteHashes), 'utf-8');
    }

    /**
     * Stores the current updateHash of a chart on SpinShare
     * @param fileReference
     * @param updateHash
     */
    setRemoteUpdateHash(fileReference, updateHash) {
        this.remoteHashes[fileReference] = { updateHash, checkedAt: Date.now() };
        this.saveRemoteHashes();
    }

    /**
     * Returns the updateHashes of all library charts on SpinShare. Hashes are cached for the duration set in libraryHashCacheHours.
     * @returns {Promise<Object<string, string>>}
     */
    async getRemoteUpdateHashes() {
        const maxAge = this.settingsManager.get('libraryHashCacheHours') * 60 * 60 * 1000;
        const now = Date.now();

        const staleFileReferences = this.items
            .map((item) => item?.fileReference)
            .filter((fileReference) => fileReference?.startsWith('spinshare_'))
            .filter((fileReference) => {
                const entry = this.remoteHashes[fileReference];
                return !entry || now - entry.checkedAt > maxAge;
            });

        if (staleFileReferences.length > 0) {
            console.log(`[Library] Checking ${staleFileReferences.length} charts for updates.`);

            for (let i = 0; i < staleFileReferences.length; i += 500) {
                const chunk = staleFileReferences.slice(i, i + 500);
                try {
                    const remoteHashes = await this.apiClient.getChartUpdateHashes(chunk);

                    // Charts missing from the response are not on SpinShare (anymore)
                    for (const fileReference of chunk) {
                        this.remoteHashes[fileReference] = { updateHash: null, checkedAt: now };
                    }
                    for (const remoteHash of remoteHashes) {
                        if (!remoteHash.fileReference) continue;
                        this.remoteHashes[remoteHash.fileReference] = { updateHash: remoteHash.updateHash, checkedAt: now };
                    }
                } catch (e) {
                    console.error(`[Library] Failed to check charts for updates: ${e.message}`);
                    break;
                }
            }

            this.saveRemoteHashes();
        }

        const updateHashes = {};
        for (const [fileReference, entry] of Object.entries(this.remoteHashes)) {
            if (entry.updateHash) {
                updateHashes[fileReference] = entry.updateHash;
            }
        }

        return updateHashes;
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
