import { EventEmitter } from 'events';
import fs from 'node:fs';
import path from 'node:path';
import * as crypto from 'node:crypto';
import { CacheItem } from './cacheItem';
import { app, nativeImage } from 'electron';

const THUMBNAIL_SIZE = 128;
const SYNC_CONCURRENCY = 4;
const FLUSH_DELAY_MS = 300;

/**
 * Runs a function for every entry of items with a concurrency limit
 * @param {Array} items
 * @param {number} limit
 * @param {function(*, number): Promise<void>} fn
 * @returns {Promise<void>}
 */
async function runPool(items, limit, fn) {
    let next = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) {
            const index = next++;
            await fn(items[index], index);
        }
    });
    await Promise.all(workers);
}

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

        /** @type {Map<string, CacheItem>} */
        this.items = new Map();
        this.apiClient = apiClient;
        this.settingsManager = settingsManager;
        this.cachePath = path.join(app.getPath('userData'), 'SpinShare', 'cache');
        this.cacheFilePath = path.join(this.cachePath, 'cache.json');
        this.remoteHashesFilePath = path.join(this.cachePath, 'remoteHashes.json');
        this.remoteHashes = {};

        this.dirty = false;
        this.remoteHashesDirty = false;
        this.flushTimer = null;
        this.remoteHashesTimer = null;
        this.syncPromise = null;
        this.rebuildPromise = null;
        this.writeChains = new Map();

        if (!fs.existsSync(this.cachePath)) {
            fs.mkdirSync(this.cachePath, { recursive: true });
        }

        this.load();
        this.loadRemoteHashes();

        console.log('[Library] Ready.');
    }

    /**
     * @returns {string}
     */
    get chartsPath() {
        return this.settingsManager.get('pathCustoms');
    }

    /**
     * Returns all cached charts
     * @returns {CacheItem[]}
     */
    getAll() {
        return [...this.items.values()];
    }

    /**
     * Rebuilds the library cache from scratch by removing all thumbnails and re-adding all srtb files in the chartsPath
     *
     * @returns {Promise<void>}
     */
    rebuild() {
        if (!this.rebuildPromise) {
            this.rebuildPromise = this.runRebuild().finally(() => {
                this.rebuildPromise = null;
            });
        }
        return this.rebuildPromise;
    }

    async runRebuild() {
        // Wait for a running sync to finish
        await this.syncPromise?.catch(() => {});

        this.items.clear();
        this.remoteHashes = {};
        this.remoteHashesDirty = true;
        this.emit('cache-rebuild-start');

        // Remove cached cover files
        const cacheFiles = await fs.promises.readdir(this.cachePath);
        await Promise.all(cacheFiles.filter((file) => file.endsWith('.png')).map((file) => fs.promises.rm(path.join(this.cachePath, file), { force: true })));

        await this.sync({ reportProgress: true });

        this.emit('cache-rebuild-done');
    }

    /**
     * new or changed charts are (re-)added, removed charts are dropped.
     * Unchanged charts (same mtime and size) are skipped.
     *
     * @param {Object} options
     * @param {boolean} options.reportProgress Emit cache-rebuild-progress events
     * @returns {Promise<void>}
     */
    sync({ reportProgress = false } = {}) {
        if (!this.syncPromise) {
            this.syncPromise = this.runSync(reportProgress).finally(() => {
                this.syncPromise = null;
            });
        }
        return this.syncPromise;
    }

    async runSync(reportProgress) {
        const startedAt = Date.now();
        const chartsPath = this.chartsPath;

        let chartFiles;
        try {
            chartFiles = (await fs.promises.readdir(chartsPath)).filter((file) => file.endsWith('.srtb'));
        } catch (e) {
            console.error(`[Library] Failed to read customs folder, skipping sync: ${e.message}`);
            if (reportProgress) {
                this.dirty = true;
                await this.flush();
            }
            return;
        }

        const [albumArts, thumbnails] = await Promise.all([this.readAlbumArts(chartsPath), this.readThumbnails()]);

        let changed = false;
        let done = 0;
        const total = chartFiles.length;
        const reportEvery = Math.max(1, Math.floor(total / 100));

        await runPool(chartFiles, SYNC_CONCURRENCY, async (file) => {
            const chartPath = path.join(chartsPath, file);
            const chartId = file.slice(0, -'.srtb'.length);

            try {
                const stat = await fs.promises.stat(chartPath);
                const cached = this.items.get(chartId);

                if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
                    // Unchanged
                } else if (cached && cached.mtimeMs === undefined) {
                    // Cached before file stats were tracked
                    cached.mtimeMs = stat.mtimeMs;
                    cached.size = stat.size;
                    cached.hasCover = thumbnails.has(chartId);
                    changed = true;
                } else {
                    await this.add(chartPath, { autoSave: false, albumArts });
                    changed = true;
                }
            } catch (e) {
                console.error(`[Library] (${chartId}) Failed to add chart to cache: ${e.message}`);
            }

            done++;
            if (reportProgress && (done % reportEvery === 0 || done === total)) {
                this.emit('cache-rebuild-progress', {
                    total,
                    current: done,
                    percent: Math.round((done / total) * 100),
                });
            }
        });

        // Drop charts that were removed
        const present = new Set(chartFiles.map((file) => file.slice(0, -'.srtb'.length)));
        for (const fileReference of [...this.items.keys()]) {
            // A download may have finished while the folder was being scanned
            if (present.has(fileReference) || fs.existsSync(path.join(chartsPath, `${fileReference}.srtb`))) continue;
            console.log(`[Library] (${fileReference}) Removed from customs folder.`);
            await this.remove(fileReference, false);
            changed = true;
        }

        // Remove remote hashes of charts that are no longer installed
        for (const fileReference of Object.keys(this.remoteHashes)) {
            if (!this.items.has(fileReference)) {
                delete this.remoteHashes[fileReference];
                this.remoteHashesDirty = true;
            }
        }

        if (reportProgress && total === 0) {
            this.emit('cache-rebuild-progress', { total: 0, current: 0, percent: 100 });
        }

        if (changed || reportProgress) {
            this.dirty = true;
            await this.flush();
        }
        if (this.remoteHashesDirty) {
            await this.saveRemoteHashes();
        }

        console.log(`[Library] Synced ${total} charts in ${Date.now() - startedAt}ms.`);
    }

    /**
     * Lists the album art folder of the customs path
     * @param {string} chartsPath
     * @returns {Promise<string[]>}
     */
    async readAlbumArts(chartsPath = this.chartsPath) {
        try {
            return await fs.promises.readdir(path.join(chartsPath, 'AlbumArt'));
        } catch {
            return [];
        }
    }

    /**
     * Returns the fileReferences that have a cached thumbnail
     * @returns {Promise<Set<string>>}
     */
    async readThumbnails() {
        try {
            const files = await fs.promises.readdir(this.cachePath);
            return new Set(files.filter((file) => file.endsWith('.png')).map((file) => file.slice(0, -'.png'.length)));
        } catch {
            return new Set();
        }
    }

    /**
     * Adds a chart to the cache & creates a thumbnail
     * @param {string} chartPath
     * @param {Object} options
     * @param {boolean} options.autoSave Save and notify the renderer
     * @param {string[]} [options.albumArts] Pre-read listing of the AlbumArt folder
     * @returns {Promise<void>}
     */
    async add(chartPath, { autoSave = true, albumArts } = {}) {
        let stat;
        try {
            stat = await fs.promises.stat(chartPath);
        } catch {
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
        cacheItem.mtimeMs = stat.mtimeMs;
        cacheItem.size = stat.size;

        // Create thumbnail
        const cacheAlbumArtPath = path.join(this.cachePath, `${chartId}.png`);
        let albumArtFilename;
        if (albumArtReference) {
            albumArts ??= await this.readAlbumArts(path.dirname(chartPath));
            albumArtFilename = albumArts.find((file) => path.parse(file).name === albumArtReference) ?? albumArts.find((file) => file.includes(albumArtReference));
        }

        if (albumArtFilename) {
            try {
                await this.generateThumbnail(path.join(path.dirname(chartPath), 'AlbumArt', albumArtFilename), cacheAlbumArtPath);
                cacheItem.hasCover = true;
            } catch (e) {
                console.error(`[Library] (${chartId}) Failed to generate thumbnail: ${e.message}`);
            }
        }
        if (!cacheItem.hasCover) {
            // Don't keep showing the cover of a previous version
            await fs.promises.rm(cacheAlbumArtPath, { force: true });
        }

        console.log(`[Library] (${chartId}) ${this.items.has(chartId) ? 'Updated' : 'Added'} in cache. UpdateHash: ${cacheItem.updateHash}`);

        this.items.delete(chartId);
        this.items.set(chartId, cacheItem);

        if (autoSave) {
            this.markChanged();
        }
    }

    /**
     * Generates a 128x128 png of the chartCoverPath and saves it to cacheCoverPath
     *
     * @param {string} chartCoverPath
     * @param {string} cacheCoverPath
     * @returns {Promise<void>}
     */
    async generateThumbnail(chartCoverPath, cacheCoverPath) {
        let png;

        // Native decoding first, if in an supported format (PNG, JPEG)
        const image = nativeImage.createFromPath(chartCoverPath);
        if (!image.isEmpty()) {
            png = image.resize({ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, quality: 'good' }).toPNG();
        } else {
            const { Jimp } = await import('jimp');
            const jimpImage = await Jimp.read(chartCoverPath);
            jimpImage.resize({ w: THUMBNAIL_SIZE, h: THUMBNAIL_SIZE });
            png = await jimpImage.getBuffer('image/png');
        }

        await fs.promises.writeFile(cacheCoverPath, png);
    }

    /**
     * Removes a chart from the library cache
     * @param {string} fileReference
     * @param {boolean} autoSave
     * @returns {Promise<void>}
     */
    async remove(fileReference, autoSave = true) {
        await fs.promises.rm(path.join(this.cachePath, `${fileReference}.png`), { force: true });

        this.items.delete(fileReference);

        if (autoSave) {
            this.markChanged();
        }
    }

    /**
     * Schedules a save and a cache-change event.
     */
    markChanged() {
        this.dirty = true;
        clearTimeout(this.flushTimer);
        this.flushTimer = setTimeout(() => this.flush(), FLUSH_DELAY_MS);
    }

    /**
     * Saves pending changes immediately.
     * @returns {Promise<void>}
     */
    async flush() {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
        if (!this.dirty) return;

        await this.save();
        this.emit('cache-change');
    }

    /**
     * Writes data as JSON to a temporary file and renames it over filePath, so a crash never leaves a half-written file.
     *
     * @param {string} filePath
     * @param {function(): *} getData
     * @returns {Promise<void>}
     */
    writeJsonAtomic(filePath, getData) {
        const previous = this.writeChains.get(filePath) ?? Promise.resolve();
        const current = previous.then(async () => {
            const tmpPath = `${filePath}.tmp`;
            try {
                await fs.promises.writeFile(tmpPath, JSON.stringify(getData()), 'utf-8');
                await fs.promises.rename(tmpPath, filePath);
            } catch (e) {
                console.error(`[Library] Failed to write ${path.basename(filePath)}: ${e.message}`);
            }
        });
        this.writeChains.set(filePath, current);
        return current;
    }

    /**
     * Sync of writeJsonAtomic
     * @param {string} filePath
     * @param {*} data
     */
    writeJsonAtomicSync(filePath, data) {
        const tmpPath = `${filePath}.tmp`;
        try {
            fs.writeFileSync(tmpPath, JSON.stringify(data), 'utf-8');
            fs.renameSync(tmpPath, filePath);
        } catch (e) {
            console.error(`[Library] Failed to write ${path.basename(filePath)}: ${e.message}`);
        }
    }

    /**
     * Saves the chart library cache
     * @returns {Promise<void>}
     */
    save() {
        console.log(`[Library] Saving cache`);
        this.dirty = false;
        return this.writeJsonAtomic(this.cacheFilePath, () => this.getAll());
    }

    /**
     * Writes all pending changes synchronously
     */
    saveSync() {
        clearTimeout(this.flushTimer);
        clearTimeout(this.remoteHashesTimer);
        if (this.dirty) {
            this.dirty = false;
            this.writeJsonAtomicSync(this.cacheFilePath, this.getAll());
        }
        if (this.remoteHashesDirty) {
            this.remoteHashesDirty = false;
            this.writeJsonAtomicSync(this.remoteHashesFilePath, this.remoteHashes);
        }
    }

    /**
     * Loads the chart library cache
     */
    load() {
        console.log(`[Library] Loading cache`);
        let loadedItems = [];
        if (fs.existsSync(this.cacheFilePath)) {
            try {
                loadedItems = JSON.parse(fs.readFileSync(this.cacheFilePath, 'utf-8'));
                if (!Array.isArray(loadedItems)) {
                    throw new Error('Cache is not an array');
                }
            } catch (e) {
                // Failsafe if the cache file is corrupted
                console.error(`[Library] Failed to load cache, starting with an empty cache: ${e.message}`);
                loadedItems = [];
            }
        }

        this.items.clear();
        for (const item of loadedItems) {
            if (!item?.fileReference) continue;
            // Migrate items cached before the rename of hasExtremeDifficulty
            if ('hasExtremeDifficulty' in item) {
                item.hasExpertDifficulty ??= item.hasExtremeDifficulty;
                delete item.hasExtremeDifficulty;
            }
            this.items.set(item.fileReference, item);
        }

        this.emit('cache-change');
        console.log(`[Library] Cache loaded (${this.items.size} charts).`);
    }

    /**
     * Returns a chart if in cache
     * @param {string} fileReference
     * @returns {CacheItem|undefined}
     */
    get(fileReference) {
        return this.items.get(fileReference);
    }

    /**
     * Returns the updateHash of a chart
     * @param {string} fileReference
     * @returns {string|null}
     */
    getUpdateHash(fileReference) {
        return this.items.get(fileReference)?.updateHash ?? null;
    }

    /**
     * Returns the path of a chart's cached thumbnail, or null if the chart is not in the cache
     * @param {string} fileReference
     * @returns {string|null}
     */
    getThumbnailPath(fileReference) {
        if (!this.items.has(fileReference)) {
            return null;
        }
        return path.join(this.cachePath, `${fileReference}.png`);
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
     * @returns {Promise<void>}
     */
    saveRemoteHashes() {
        clearTimeout(this.remoteHashesTimer);
        this.remoteHashesTimer = null;
        this.remoteHashesDirty = false;
        return this.writeJsonAtomic(this.remoteHashesFilePath, () => this.remoteHashes);
    }

    /**
     * Stores the current updateHash of a chart on SpinShare
     * @param {string} fileReference
     * @param {string} updateHash
     */
    setRemoteUpdateHash(fileReference, updateHash) {
        this.remoteHashes[fileReference] = { updateHash, checkedAt: Date.now() };
        this.remoteHashesDirty = true;
        clearTimeout(this.remoteHashesTimer);
        this.remoteHashesTimer = setTimeout(() => this.saveRemoteHashes(), FLUSH_DELAY_MS);
    }

    /**
     * Returns the updateHashes of all library charts on SpinShare. Hashes are cached for the duration set in libraryHashCacheHours.
     * @returns {Promise<Object<string, string>>}
     */
    async getRemoteUpdateHashes() {
        const maxAge = this.settingsManager.get('libraryHashCacheHours') * 60 * 60 * 1000;
        const now = Date.now();

        const staleFileReferences = [...this.items.keys()].filter((fileReference) => {
            if (!fileReference.startsWith('spinshare_')) return false;
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

            await this.saveRemoteHashes();
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
     * @param {string} fileReference
     * @returns {Promise<string|null>}
     */
    async getThumbnailAsBase64(fileReference) {
        const cacheCoverPath = this.getThumbnailPath(fileReference);
        if (!cacheCoverPath) {
            return null;
        }

        try {
            return await fs.promises.readFile(cacheCoverPath, { encoding: 'base64' });
        } catch {
            return null;
        }
    }
}
