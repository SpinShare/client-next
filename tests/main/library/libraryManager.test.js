import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as crypto from 'node:crypto';
import { makeSrtb, makeTempDirs, DIFFICULTY_TYPES } from './helpers';

const mocks = vi.hoisted(() => ({
    userData: '',
    createFromPath: vi.fn(),
    resize: vi.fn(),
    jimpRead: vi.fn(),
}));

vi.mock('electron', () => ({
    app: { getPath: () => mocks.userData },
    nativeImage: { createFromPath: mocks.createFromPath },
}));
vi.mock('jimp', () => ({
    Jimp: { read: mocks.jimpRead },
}));

const { LibraryManager } = await import('../../../src/main/library/index.js');

const FLUSH_DELAY_MS = 300;
const HOUR = 60 * 60 * 1000;

describe('LibraryManager', () => {
    let dirs;
    let settingsValues;
    let settings;
    let api;
    let libraries;

    function createLibrary() {
        const library = new LibraryManager(api, settings);
        libraries.push(library);
        return library;
    }

    function writeChart(fileReference, options, folder = dirs.customs) {
        const chartPath = path.join(folder, `${fileReference}.srtb`);
        fs.writeFileSync(chartPath, makeSrtb(options));
        return chartPath;
    }

    function writeAlbumArt(filename = 'cover.png', folder = dirs.customs) {
        fs.mkdirSync(path.join(folder, 'AlbumArt'), { recursive: true });
        fs.writeFileSync(path.join(folder, 'AlbumArt', filename), 'image');
    }

    function writeCacheFile(items) {
        fs.mkdirSync(dirs.cache, { recursive: true });
        fs.writeFileSync(cacheFile(), JSON.stringify(items));
    }

    const cacheFile = () => path.join(dirs.cache, 'cache.json');
    const remoteHashesFile = () => path.join(dirs.cache, 'remoteHashes.json');
    const thumbnail = (fileReference) => path.join(dirs.cache, `${fileReference}.png`);
    const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
    const md5 = (content) => crypto.createHash('md5').update(content).digest('hex');
    const fileReferences = (library) => library.getAll().map((item) => item.fileReference);

    // Seed directly without filesystem
    function seed(library, references) {
        for (const fileReference of references) {
            library.items.set(fileReference, { fileReference, updateHash: `local-${fileReference}` });
        }
    }

    // Wait for debounced saves
    async function settle(library) {
        await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);
        await Promise.all(library.writeChains.values());
        await new Promise((resolve) => setImmediate(resolve));
    }

    function useFakeTimers() {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    }

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        dirs = makeTempDirs();
        mocks.userData = dirs.userData;
        mocks.resize.mockImplementation(() => ({ toPNG: () => Buffer.from('thumbnail') }));
        mocks.createFromPath.mockImplementation(() => ({ isEmpty: () => false, resize: mocks.resize }));

        settingsValues = { pathCustoms: dirs.customs, libraryHashCacheHours: 24 };
        settings = { get: (key) => settingsValues[key] };
        api = {
            getChartUpdateHashes: vi.fn(async (references) => references.map((fileReference) => ({ fileReference, updateHash: `remote-${fileReference}` }))),
        };
        libraries = [];
    });

    afterEach(async () => {
        vi.useRealTimers();
        for (const library of libraries) {
            clearTimeout(library.flushTimer);
            clearTimeout(library.remoteHashesTimer);
            await library.syncPromise?.catch(() => {});
            await library.rebuildPromise?.catch(() => {});
            await Promise.all(library.writeChains.values());
        }
        vi.restoreAllMocks();
        dirs.cleanup();
    });

    describe('constructor and load', () => {
        it('creates the cache folder and starts empty', () => {
            const library = createLibrary();

            expect(fs.existsSync(dirs.cache)).toBe(true);
            expect(library.getAll()).toEqual([]);
            expect(console.error).not.toHaveBeenCalled();
        });

        it('loads cached items keyed by fileReference', () => {
            writeCacheFile([
                { fileReference: 'spinshare_a', title: 'A', updateHash: 'ha' },
                { fileReference: 'local_b', title: 'B', updateHash: 'hb' },
            ]);

            const library = createLibrary();

            expect(fileReferences(library)).toEqual(['spinshare_a', 'local_b']);
            expect(library.get('local_b').title).toBe('B');
        });

        it('starts empty when the cache file is corrupted', () => {
            fs.mkdirSync(dirs.cache, { recursive: true });
            fs.writeFileSync(cacheFile(), '[{"fileReference": "spinsh');

            const library = createLibrary();

            expect(library.getAll()).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to load cache'));
        });

        it('starts empty when the cache file is not an array', () => {
            writeCacheFile({ fileReference: 'spinshare_a' });

            const library = createLibrary();

            expect(library.getAll()).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Cache is not an array'));
        });

        it('skips invalid entries', () => {
            writeCacheFile([null, {}, { title: 'no reference' }, { fileReference: 'spinshare_a' }]);

            const library = createLibrary();

            expect(fileReferences(library)).toEqual(['spinshare_a']);
        });

        it('migrates hasExtremeDifficulty to hasExpertDifficulty', () => {
            writeCacheFile([
                { fileReference: 'old', hasExtremeDifficulty: true },
                { fileReference: 'both', hasExtremeDifficulty: true, hasExpertDifficulty: false },
            ]);

            const library = createLibrary();

            expect(library.get('old').hasExpertDifficulty).toBe(true);
            expect(library.get('old')).not.toHaveProperty('hasExtremeDifficulty');
            expect(library.get('both').hasExpertDifficulty).toBe(false);
            expect(library.get('both')).not.toHaveProperty('hasExtremeDifficulty');
        });

        it('loads remote hashes', () => {
            fs.mkdirSync(dirs.cache, { recursive: true });
            fs.writeFileSync(remoteHashesFile(), JSON.stringify({ spinshare_a: { updateHash: 'x', checkedAt: 1 } }));

            const library = createLibrary();

            expect(library.remoteHashes).toEqual({ spinshare_a: { updateHash: 'x', checkedAt: 1 } });
        });

        it('starts without remote hashes when their file is corrupted', () => {
            fs.mkdirSync(dirs.cache, { recursive: true });
            fs.writeFileSync(remoteHashesFile(), '{broken');

            const library = createLibrary();

            expect(library.remoteHashes).toEqual({});
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to load remote hashes'));
        });
    });

    describe('getters', () => {
        it('get returns the cached item or undefined', () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            expect(library.get('spinshare_a').fileReference).toBe('spinshare_a');
            expect(library.get('spinshare_missing')).toBeUndefined();
        });

        it('getUpdateHash returns the hash or null', () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            expect(library.getUpdateHash('spinshare_a')).toBe('local-spinshare_a');
            expect(library.getUpdateHash('spinshare_missing')).toBeNull();
        });

        it('getAll returns a copy in insertion order', () => {
            const library = createLibrary();
            seed(library, ['c', 'a', 'b']);

            const all = library.getAll();
            all.pop();

            expect(fileReferences(library)).toEqual(['c', 'a', 'b']);
        });

        it('chartsPath follows the setting', () => {
            const library = createLibrary();
            settingsValues.pathCustoms = '/somewhere/else';

            expect(library.chartsPath).toBe('/somewhere/else');
        });

        it('getThumbnailPath only resolves known charts', () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            expect(library.getThumbnailPath('spinshare_a')).toBe(thumbnail('spinshare_a'));
            expect(library.getThumbnailPath('spinshare_missing')).toBeNull();
            expect(library.getThumbnailPath('../../secret')).toBeNull();
        });

        it('getThumbnailAsBase64 returns the thumbnail or null', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a', 'spinshare_b']);
            fs.writeFileSync(thumbnail('spinshare_a'), 'png-data');

            expect(await library.getThumbnailAsBase64('spinshare_a')).toBe(Buffer.from('png-data').toString('base64'));
            expect(await library.getThumbnailAsBase64('spinshare_b')).toBeNull();
            expect(await library.getThumbnailAsBase64('spinshare_missing')).toBeNull();
        });
    });

    describe('add', () => {
        it('caches the chart metadata', async () => {
            const library = createLibrary();
            const chartPath = writeChart('spinshare_a', { title: 'Song', artist: 'Band', difficulties: [{ type: DIFFICULTY_TYPES.XD, rating: 33 }] });

            await library.add(chartPath, { autoSave: false });

            const item = library.get('spinshare_a');
            const stat = fs.statSync(chartPath);
            expect(item).toMatchObject({
                title: 'Song',
                artist: 'Band',
                hasXDDifficulty: true,
                XDDifficulty: 33,
                fileReference: 'spinshare_a',
                srtbPath: 'spinshare_a.srtb',
                mtimeMs: stat.mtimeMs,
                size: stat.size,
            });
        });

        it('computes the updateHash like the server (md5 of the file)', async () => {
            const library = createLibrary();
            const chartPath = writeChart('spinshare_a');

            await library.add(chartPath, { autoSave: false });

            expect(library.getUpdateHash('spinshare_a')).toBe(md5(fs.readFileSync(chartPath, 'utf-8')));
        });

        it('ignores files that do not exist', async () => {
            const library = createLibrary();

            await expect(library.add(path.join(dirs.customs, 'missing.srtb'))).resolves.toBeUndefined();
            expect(library.getAll()).toEqual([]);
        });

        it('rejects invalid srtb files without caching them', async () => {
            const library = createLibrary();
            const chartPath = path.join(dirs.customs, 'broken.srtb');
            fs.writeFileSync(chartPath, 'not json');

            await expect(library.add(chartPath, { autoSave: false })).rejects.toThrow();
            expect(library.get('broken')).toBeUndefined();
        });

        it('generates a thumbnail from the album art', async () => {
            const library = createLibrary();
            writeAlbumArt('cover.png');
            const chartPath = writeChart('spinshare_a', { albumArt: 'cover' });

            await library.add(chartPath, { autoSave: false });

            expect(mocks.createFromPath).toHaveBeenCalledWith(path.join(dirs.customs, 'AlbumArt', 'cover.png'));
            expect(fs.readFileSync(thumbnail('spinshare_a'), 'utf-8')).toBe('thumbnail');
            expect(library.get('spinshare_a').hasCover).toBe(true);
        });

        it('prefers an exact album art name over a partial match', async () => {
            const library = createLibrary();
            writeAlbumArt('cover_old.png');
            writeAlbumArt('cover.jpg');
            const chartPath = writeChart('spinshare_a', { albumArt: 'cover' });

            await library.add(chartPath, { autoSave: false });

            expect(mocks.createFromPath).toHaveBeenCalledWith(path.join(dirs.customs, 'AlbumArt', 'cover.jpg'));
        });

        it('falls back to a partial album art name match', async () => {
            const library = createLibrary();
            writeAlbumArt('big_cover_art.jpg');
            const chartPath = writeChart('spinshare_a', { albumArt: 'cover' });

            await library.add(chartPath, { autoSave: false });

            expect(mocks.createFromPath).toHaveBeenCalledWith(path.join(dirs.customs, 'AlbumArt', 'big_cover_art.jpg'));
            expect(library.get('spinshare_a').hasCover).toBe(true);
        });

        it('caches charts whose album art is missing without a cover', async () => {
            const library = createLibrary();
            const chartPath = writeChart('spinshare_a', { albumArt: 'cover' });

            await library.add(chartPath, { autoSave: false });

            expect(mocks.createFromPath).not.toHaveBeenCalled();
            expect(library.get('spinshare_a').hasCover).toBe(false);
            expect(fs.existsSync(thumbnail('spinshare_a'))).toBe(false);
        });

        it('caches charts without an album art reference', async () => {
            const library = createLibrary();
            writeAlbumArt('cover.png');
            fs.writeFileSync(thumbnail('spinshare_a'), 'old cover');
            const chartPath = writeChart('spinshare_a', { albumArt: null });

            await library.add(chartPath, { autoSave: false });

            expect(library.get('spinshare_a')).toMatchObject({ title: 'Title', hasCover: false });
            expect(mocks.createFromPath).not.toHaveBeenCalled();
            expect(fs.existsSync(thumbnail('spinshare_a'))).toBe(false);
        });

        it('caches charts when the AlbumArt folder does not exist', async () => {
            const library = createLibrary();
            fs.rmSync(path.join(dirs.customs, 'AlbumArt'), { recursive: true });
            const chartPath = writeChart('spinshare_a');

            await library.add(chartPath, { autoSave: false });

            expect(library.get('spinshare_a').hasCover).toBe(false);
        });

        it('removes the thumbnail of a previous version when the new one has no album art', async () => {
            const library = createLibrary();
            fs.writeFileSync(thumbnail('spinshare_a'), 'old cover');
            const chartPath = writeChart('spinshare_a', { albumArt: 'gone' });

            await library.add(chartPath, { autoSave: false });

            expect(fs.existsSync(thumbnail('spinshare_a'))).toBe(false);
        });

        it('still caches the chart when the thumbnail cannot be generated', async () => {
            const library = createLibrary();
            writeAlbumArt('cover.png');
            mocks.createFromPath.mockImplementation(() => {
                throw new Error('decode failed');
            });
            const chartPath = writeChart('spinshare_a');

            await library.add(chartPath, { autoSave: false });

            expect(library.get('spinshare_a').hasCover).toBe(false);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to generate thumbnail'));
        });

        it('uses a given album art listing instead of reading the folder', async () => {
            const library = createLibrary();
            writeAlbumArt('cover.png');
            const chartPath = writeChart('spinshare_a');

            await library.add(chartPath, { autoSave: false, albumArts: [] });

            expect(mocks.createFromPath).not.toHaveBeenCalled();
            expect(library.get('spinshare_a').hasCover).toBe(false);
        });

        it('replaces an existing chart and moves it to the end', async () => {
            const library = createLibrary();
            const chartA = writeChart('spinshare_a', { title: 'Old' });
            const chartB = writeChart('spinshare_b');
            await library.add(chartA, { autoSave: false });
            await library.add(chartB, { autoSave: false });
            const oldHash = library.getUpdateHash('spinshare_a');

            writeChart('spinshare_a', { title: 'New' });
            await library.add(chartA, { autoSave: false });

            expect(fileReferences(library)).toEqual(['spinshare_b', 'spinshare_a']);
            expect(library.get('spinshare_a').title).toBe('New');
            expect(library.getUpdateHash('spinshare_a')).not.toBe(oldHash);
        });

        it('does not save when autoSave is disabled', async () => {
            const library = createLibrary();

            await library.add(writeChart('spinshare_a'), { autoSave: false });

            expect(library.flushTimer).toBeNull();
            expect(library.dirty).toBe(false);
        });

        it('saves and notifies once for a burst of adds', async () => {
            useFakeTimers();
            const library = createLibrary();
            const changes = vi.fn();
            library.on('cache-change', changes);
            const saveSpy = vi.spyOn(library, 'save');

            for (const fileReference of ['spinshare_a', 'spinshare_b', 'spinshare_c']) {
                await library.add(writeChart(fileReference));
            }

            expect(changes).not.toHaveBeenCalled();
            expect(fs.existsSync(cacheFile())).toBe(false);

            await settle(library);

            expect(changes).toHaveBeenCalledTimes(1);
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(readJson(cacheFile()).map((item) => item.fileReference)).toEqual(['spinshare_a', 'spinshare_b', 'spinshare_c']);
        });
    });

    describe('generateThumbnail', () => {
        it('resizes natively to 128x128 and writes a png', async () => {
            const library = createLibrary();
            const target = path.join(dirs.cache, 'out.png');

            await library.generateThumbnail('/art/cover.png', target);

            expect(mocks.createFromPath).toHaveBeenCalledWith('/art/cover.png');
            expect(mocks.resize).toHaveBeenCalledWith({ width: 128, height: 128, quality: 'good' });
            expect(fs.readFileSync(target, 'utf-8')).toBe('thumbnail');
            expect(mocks.jimpRead).not.toHaveBeenCalled();
        });

        it('falls back to Jimp for formats nativeImage cannot read', async () => {
            const library = createLibrary();
            const target = path.join(dirs.cache, 'out.png');
            const jimpImage = { resize: vi.fn(), getBuffer: vi.fn(async () => Buffer.from('jimp-png')) };
            mocks.createFromPath.mockImplementation(() => ({ isEmpty: () => true }));
            mocks.jimpRead.mockResolvedValue(jimpImage);

            await library.generateThumbnail('/art/cover.tga', target);

            expect(mocks.jimpRead).toHaveBeenCalledWith('/art/cover.tga');
            expect(jimpImage.resize).toHaveBeenCalledWith({ w: 128, h: 128 });
            expect(jimpImage.getBuffer).toHaveBeenCalledWith('image/png');
            expect(fs.readFileSync(target, 'utf-8')).toBe('jimp-png');
        });

        it('rejects when neither nativeImage nor Jimp can read the image', async () => {
            const library = createLibrary();
            mocks.createFromPath.mockImplementation(() => ({ isEmpty: () => true }));
            mocks.jimpRead.mockRejectedValue(new Error('unsupported'));

            await expect(library.generateThumbnail('/art/cover.xyz', path.join(dirs.cache, 'out.png'))).rejects.toThrow('unsupported');
        });
    });

    describe('remove', () => {
        it('removes the chart and its thumbnail', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a', 'spinshare_b']);
            fs.writeFileSync(thumbnail('spinshare_a'), 'png');

            await library.remove('spinshare_a', false);

            expect(fileReferences(library)).toEqual(['spinshare_b']);
            expect(fs.existsSync(thumbnail('spinshare_a'))).toBe(false);
        });

        it('does not fail without a thumbnail or for unknown charts', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            await expect(library.remove('spinshare_a', false)).resolves.toBeUndefined();
            await expect(library.remove('spinshare_missing', false)).resolves.toBeUndefined();
        });

        it('saves and notifies when autoSave is enabled', async () => {
            useFakeTimers();
            const library = createLibrary();
            seed(library, ['spinshare_a', 'spinshare_b']);
            const changes = vi.fn();
            library.on('cache-change', changes);

            await library.remove('spinshare_a');
            await settle(library);

            expect(changes).toHaveBeenCalledTimes(1);
            expect(readJson(cacheFile()).map((item) => item.fileReference)).toEqual(['spinshare_b']);
        });

        it('does not save when autoSave is disabled', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            await library.remove('spinshare_a', false);

            expect(library.flushTimer).toBeNull();
        });
    });

    describe('sync', () => {
        it('adds all srtb files of the customs folder', async () => {
            writeAlbumArt('cover.png');
            writeChart('spinshare_a');
            writeChart('spinshare_b');
            writeChart('local_c');
            fs.writeFileSync(path.join(dirs.customs, 'readme.txt'), 'not a chart');
            const library = createLibrary();
            const changes = vi.fn();
            library.on('cache-change', changes);

            await library.sync();

            expect(fileReferences(library).sort()).toEqual(['local_c', 'spinshare_a', 'spinshare_b']);
            expect(fs.existsSync(thumbnail('spinshare_a'))).toBe(true);
            expect(changes).toHaveBeenCalledTimes(1);
            expect(readJson(cacheFile())).toHaveLength(3);
        });

        it('skips unchanged charts', async () => {
            writeChart('spinshare_a');
            writeChart('spinshare_b');
            const library = createLibrary();
            await library.sync();
            const addSpy = vi.spyOn(library, 'add');
            const saveSpy = vi.spyOn(library, 'save');
            const changes = vi.fn();
            library.on('cache-change', changes);

            await library.sync();

            expect(addSpy).not.toHaveBeenCalled();
            expect(saveSpy).not.toHaveBeenCalled();
            expect(changes).not.toHaveBeenCalled();
        });

        it('re-adds changed charts', async () => {
            const chartPath = writeChart('spinshare_a', { title: 'Old' });
            const library = createLibrary();
            await library.sync();

            writeChart('spinshare_a', { title: 'New and longer' });
            const future = new Date(Date.now() + 60_000);
            fs.utimesSync(chartPath, future, future);
            await library.sync();

            expect(library.get('spinshare_a').title).toBe('New and longer');
            expect(readJson(cacheFile())[0].title).toBe('New and longer');
        });

        it('picks up charts added outside the app', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            await library.sync();
            const addSpy = vi.spyOn(library, 'add');

            writeChart('spinshare_new');
            await library.sync();

            expect(addSpy).toHaveBeenCalledTimes(1);
            expect(library.get('spinshare_new')).toBeDefined();
        });

        it('drops charts removed outside the app, including their thumbnail', async () => {
            writeAlbumArt('cover.png');
            const chartPath = writeChart('spinshare_a');
            writeChart('spinshare_b');
            const library = createLibrary();
            await library.sync();

            fs.rmSync(chartPath);
            await library.sync();

            expect(fileReferences(library)).toEqual(['spinshare_b']);
            expect(fs.existsSync(thumbnail('spinshare_a'))).toBe(false);
            expect(readJson(cacheFile()).map((item) => item.fileReference)).toEqual(['spinshare_b']);
        });

        it('keeps charts that appear while the folder is being scanned', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            seed(library, ['spinshare_downloaded']);
            const realReaddir = fs.promises.readdir.bind(fs.promises);
            vi.spyOn(fs.promises, 'readdir').mockImplementation(async (folder, ...args) => {
                const files = await realReaddir(folder, ...args);

                if (folder === dirs.customs) writeChart('spinshare_downloaded');
                return files;
            });

            await library.sync();

            expect(library.get('spinshare_downloaded')).toBeDefined();
        });

        it('adopts file stats of charts cached before stats were tracked instead of re-parsing them', async () => {
            const chartA = writeChart('spinshare_a');
            writeChart('spinshare_b');
            writeCacheFile([
                { fileReference: 'spinshare_a', title: 'cached A' },
                { fileReference: 'spinshare_b', title: 'cached B' },
            ]);
            fs.writeFileSync(thumbnail('spinshare_a'), 'png');
            const library = createLibrary();
            const addSpy = vi.spyOn(library, 'add');

            await library.sync();

            expect(addSpy).not.toHaveBeenCalled();
            expect(library.get('spinshare_a')).toMatchObject({ title: 'cached A', mtimeMs: fs.statSync(chartA).mtimeMs, size: fs.statSync(chartA).size, hasCover: true });
            expect(library.get('spinshare_b').hasCover).toBe(false);
            expect(readJson(cacheFile())[0].mtimeMs).toBe(fs.statSync(chartA).mtimeMs);
        });

        it('continues when a single chart is broken', async () => {
            writeChart('spinshare_a');
            fs.writeFileSync(path.join(dirs.customs, 'broken.srtb'), '{');
            writeChart('spinshare_c');
            const library = createLibrary();

            await library.sync();

            expect(fileReferences(library).sort()).toEqual(['spinshare_a', 'spinshare_c']);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('(broken) Failed to add chart'));
        });

        it('keeps the cache when the customs folder cannot be read', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            await library.sync();
            const changes = vi.fn();
            library.on('cache-change', changes);

            settingsValues.pathCustoms = path.join(dirs.root, 'unmounted-sd-card');
            await library.sync();

            expect(fileReferences(library)).toEqual(['spinshare_a']);
            expect(changes).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to read customs folder'));
        });

        it('still notifies when reporting progress and the customs folder cannot be read', async () => {
            settingsValues.pathCustoms = path.join(dirs.root, 'missing');
            const library = createLibrary();
            const changes = vi.fn();
            library.on('cache-change', changes);

            await library.sync({ reportProgress: true });

            expect(changes).toHaveBeenCalledTimes(1);
        });

        it('uses the current customs path setting', async () => {
            writeChart('spinshare_a');
            const otherCustoms = path.join(dirs.root, 'other');
            fs.mkdirSync(otherCustoms);
            writeChart('spinshare_other', {}, otherCustoms);
            const library = createLibrary();
            await library.sync();

            settingsValues.pathCustoms = otherCustoms;
            await library.sync();

            expect(fileReferences(library)).toEqual(['spinshare_other']);
        });

        it('shares a running sync between callers', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            const runSpy = vi.spyOn(library, 'runSync');

            const first = library.sync();
            const second = library.sync();

            expect(second).toBe(first);
            await Promise.all([first, second]);
            expect(runSpy).toHaveBeenCalledTimes(1);

            await library.sync();
            expect(runSpy).toHaveBeenCalledTimes(2);
        });

        it('forgets remote hashes of charts that are no longer installed', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            library.remoteHashes = {
                spinshare_a: { updateHash: 'a', checkedAt: 1 },
                spinshare_gone: { updateHash: 'g', checkedAt: 1 },
            };

            await library.sync();

            expect(Object.keys(library.remoteHashes)).toEqual(['spinshare_a']);
            expect(Object.keys(readJson(remoteHashesFile()))).toEqual(['spinshare_a']);
        });

        it('limits how many charts are processed at once', async () => {
            for (let i = 0; i < 12; i++) writeChart(`spinshare_${i}`);
            const library = createLibrary();
            const realAdd = library.add.bind(library);
            let inFlight = 0;
            let maxInFlight = 0;
            vi.spyOn(library, 'add').mockImplementation(async (...args) => {
                inFlight++;
                maxInFlight = Math.max(maxInFlight, inFlight);
                try {
                    await realAdd(...args);
                } finally {
                    inFlight--;
                }
            });

            await library.sync();

            expect(library.getAll()).toHaveLength(12);
            expect(maxInFlight).toBeGreaterThan(1);
            expect(maxInFlight).toBeLessThanOrEqual(4);
        });

        describe('progress', () => {
            it('is not reported by default', async () => {
                writeChart('spinshare_a');
                const library = createLibrary();
                const progress = vi.fn();
                library.on('cache-rebuild-progress', progress);

                await library.sync();

                expect(progress).not.toHaveBeenCalled();
            });

            it('counts up to 100 percent', async () => {
                writeChart('spinshare_a');
                writeChart('spinshare_b');
                writeChart('spinshare_c');
                const library = createLibrary();
                const progress = vi.fn();
                library.on('cache-rebuild-progress', progress);

                await library.sync({ reportProgress: true });

                const events = progress.mock.calls.map(([status]) => status);
                expect(events.map((status) => status.current)).toEqual([1, 2, 3]);
                expect(events.at(-1)).toEqual({ total: 3, current: 3, percent: 100 });
            });

            it('reports completion for an empty customs folder', async () => {
                const library = createLibrary();
                const progress = vi.fn();
                library.on('cache-rebuild-progress', progress);

                await library.sync({ reportProgress: true });

                expect(progress).toHaveBeenCalledWith({ total: 0, current: 0, percent: 100 });
            });

            it('is throttled for large libraries', async () => {
                for (let i = 0; i < 250; i++) writeChart(`spinshare_${i}`, { albumArt: 'none' });
                const library = createLibrary();
                const progress = vi.fn();
                library.on('cache-rebuild-progress', progress);

                await library.sync({ reportProgress: true });

                expect(progress.mock.calls.length).toBeLessThanOrEqual(126);
                expect(progress.mock.calls.at(-1)[0]).toEqual({ total: 250, current: 250, percent: 100 });
            });
        });
    });

    describe('rebuild', () => {
        it('emits start, progress, change and done in order', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            const events = [];
            for (const event of ['cache-rebuild-start', 'cache-rebuild-progress', 'cache-change', 'cache-rebuild-done']) {
                library.on(event, () => events.push(event));
            }

            await library.rebuild();

            expect(events).toEqual(['cache-rebuild-start', 'cache-rebuild-progress', 'cache-change', 'cache-rebuild-done']);
        });

        it('re-parses every chart, even unchanged ones', async () => {
            writeChart('spinshare_a');
            writeChart('spinshare_b');
            const library = createLibrary();
            await library.sync();
            const addSpy = vi.spyOn(library, 'add');

            await library.rebuild();

            expect(addSpy).toHaveBeenCalledTimes(2);
            expect(library.getAll()).toHaveLength(2);
        });

        it('deletes orphaned thumbnails and regenerates the others', async () => {
            writeAlbumArt('cover.png');
            writeChart('spinshare_a');
            const library = createLibrary();
            fs.mkdirSync(dirs.cache, { recursive: true });
            fs.writeFileSync(thumbnail('orphan'), 'png');
            fs.writeFileSync(thumbnail('spinshare_a'), 'stale');

            await library.rebuild();

            expect(fs.existsSync(thumbnail('orphan'))).toBe(false);
            expect(fs.readFileSync(thumbnail('spinshare_a'), 'utf-8')).toBe('thumbnail');
            expect(fs.existsSync(cacheFile())).toBe(true);
        });

        it('drops cached charts that no longer exist', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            seed(library, ['spinshare_gone']);

            await library.rebuild();

            expect(fileReferences(library)).toEqual(['spinshare_a']);
        });

        it('clears the remote hashes', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            library.remoteHashes = { spinshare_a: { updateHash: 'a', checkedAt: Date.now() } };

            await library.rebuild();

            expect(library.remoteHashes).toEqual({});
            expect(readJson(remoteHashesFile())).toEqual({});
        });

        it('shares a running rebuild between callers', async () => {
            writeChart('spinshare_a');
            const library = createLibrary();
            const starts = vi.fn();
            library.on('cache-rebuild-start', starts);

            await Promise.all([library.rebuild(), library.rebuild()]);

            expect(starts).toHaveBeenCalledTimes(1);

            await library.rebuild();
            expect(starts).toHaveBeenCalledTimes(2);
        });

        it('waits for a running sync before clearing the cache', async () => {
            writeChart('spinshare_a');
            writeChart('spinshare_b');
            const library = createLibrary();
            const events = [];
            library.on('cache-change', () => events.push('change'));
            library.on('cache-rebuild-start', () => events.push('start'));

            const sync = library.sync();
            const rebuild = library.rebuild();
            await Promise.all([sync, rebuild]);

            expect(events).toEqual(['change', 'start', 'change']);
            expect(library.getAll()).toHaveLength(2);
        });
    });

    describe('persistence', () => {
        it('writes the cache atomically', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            await library.save();

            expect(readJson(cacheFile())).toEqual([{ fileReference: 'spinshare_a', updateHash: 'local-spinshare_a' }]);
            expect(fs.existsSync(`${cacheFile()}.tmp`)).toBe(false);
        });

        it('serializes concurrent writes and keeps the latest state', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);

            const first = library.save();
            seed(library, ['spinshare_b']);
            const second = library.save();
            await Promise.all([first, second]);

            expect(readJson(cacheFile()).map((item) => item.fileReference)).toEqual(['spinshare_a', 'spinshare_b']);
        });

        it('logs write errors instead of throwing', async () => {
            const library = createLibrary();
            fs.mkdirSync(cacheFile(), { recursive: true });

            await expect(library.save()).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to write cache.json'));
        });

        it('keeps writing after a failed write', async () => {
            const library = createLibrary();
            fs.mkdirSync(cacheFile(), { recursive: true });
            await library.save();
            fs.rmSync(cacheFile(), { recursive: true });
            seed(library, ['spinshare_a']);

            await library.save();

            expect(readJson(cacheFile())).toHaveLength(1);
        });

        it('flush does nothing without changes', async () => {
            const library = createLibrary();
            const changes = vi.fn();
            library.on('cache-change', changes);

            await library.flush();

            expect(changes).not.toHaveBeenCalled();
            expect(fs.existsSync(cacheFile())).toBe(false);
        });

        it('saveSync writes pending changes immediately and cancels scheduled saves', async () => {
            useFakeTimers();
            const library = createLibrary();
            await library.add(writeChart('spinshare_a'));
            library.setRemoteUpdateHash('spinshare_a', 'remote');
            const saveSpy = vi.spyOn(library, 'save');

            library.saveSync();

            expect(readJson(cacheFile()).map((item) => item.fileReference)).toEqual(['spinshare_a']);
            expect(readJson(remoteHashesFile()).spinshare_a.updateHash).toBe('remote');
            expect(fs.existsSync(`${cacheFile()}.tmp`)).toBe(false);

            await settle(library);
            expect(saveSpy).not.toHaveBeenCalled();
        });

        it('saveSync does nothing without changes', () => {
            const library = createLibrary();

            library.saveSync();

            expect(fs.existsSync(cacheFile())).toBe(false);
            expect(fs.existsSync(remoteHashesFile())).toBe(false);
        });

        it('round-trips through a restart without re-parsing charts', async () => {
            writeAlbumArt('cover.png');
            writeChart('spinshare_a');
            writeChart('spinshare_b');
            const first = createLibrary();
            await first.sync();

            const second = createLibrary();
            const addSpy = vi.spyOn(second, 'add');
            await second.sync();

            expect(second.getAll()).toEqual(first.getAll());
            expect(addSpy).not.toHaveBeenCalled();
        });
    });

    describe('remote hashes', () => {
        it('setRemoteUpdateHash stores the hash and saves debounced', async () => {
            useFakeTimers();
            const library = createLibrary();

            library.setRemoteUpdateHash('spinshare_a', 'h1');
            library.setRemoteUpdateHash('spinshare_b', 'h2');

            expect(library.remoteHashes.spinshare_a).toEqual({ updateHash: 'h1', checkedAt: expect.any(Number) });
            expect(fs.existsSync(remoteHashesFile())).toBe(false);

            await settle(library);

            expect(Object.keys(readJson(remoteHashesFile()))).toEqual(['spinshare_a', 'spinshare_b']);
        });

        it('fetches hashes for SpinShare charts only', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a', 'local_b', 'spinshare_c']);

            const hashes = await library.getRemoteUpdateHashes();

            expect(api.getChartUpdateHashes).toHaveBeenCalledWith(['spinshare_a', 'spinshare_c']);
            expect(hashes).toEqual({ spinshare_a: 'remote-spinshare_a', spinshare_c: 'remote-spinshare_c' });
            expect(readJson(remoteHashesFile()).spinshare_a.updateHash).toBe('remote-spinshare_a');
        });

        it('does not call the API while cached hashes are fresh', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);
            await library.getRemoteUpdateHashes();

            const hashes = await library.getRemoteUpdateHashes();

            expect(api.getChartUpdateHashes).toHaveBeenCalledTimes(1);
            expect(hashes).toEqual({ spinshare_a: 'remote-spinshare_a' });
        });

        it('refetches hashes older than libraryHashCacheHours', async () => {
            settingsValues.libraryHashCacheHours = 2;
            const library = createLibrary();
            seed(library, ['spinshare_old', 'spinshare_fresh']);
            library.remoteHashes = {
                spinshare_old: { updateHash: 'old', checkedAt: Date.now() - 3 * HOUR },
                spinshare_fresh: { updateHash: 'fresh', checkedAt: Date.now() - HOUR },
            };

            const hashes = await library.getRemoteUpdateHashes();

            expect(api.getChartUpdateHashes).toHaveBeenCalledWith(['spinshare_old']);
            expect(hashes).toEqual({ spinshare_old: 'remote-spinshare_old', spinshare_fresh: 'fresh' });
        });

        it('remembers charts that are not on SpinShare without returning them', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a', 'spinshare_deleted']);
            api.getChartUpdateHashes.mockResolvedValue([{ fileReference: 'spinshare_a', updateHash: 'ha' }, { updateHash: 'no reference' }]);

            const hashes = await library.getRemoteUpdateHashes();
            await library.getRemoteUpdateHashes();

            expect(hashes).toEqual({ spinshare_a: 'ha' });
            expect(library.remoteHashes.spinshare_deleted).toEqual({ updateHash: null, checkedAt: expect.any(Number) });
            expect(api.getChartUpdateHashes).toHaveBeenCalledTimes(1);
        });

        it('requests hashes in chunks of 500', async () => {
            const library = createLibrary();
            seed(
                library,
                Array.from({ length: 1200 }, (_, i) => `spinshare_${i}`),
            );

            const hashes = await library.getRemoteUpdateHashes();

            expect(api.getChartUpdateHashes.mock.calls.map(([chunk]) => chunk.length)).toEqual([500, 500, 200]);
            expect(Object.keys(hashes)).toHaveLength(1200);
        });

        it('stops on API errors and returns what is known', async () => {
            const library = createLibrary();
            seed(
                library,
                Array.from({ length: 1200 }, (_, i) => `spinshare_${i}`),
            );
            api.getChartUpdateHashes.mockImplementationOnce(async (references) => references.map((fileReference) => ({ fileReference, updateHash: 'h' }))).mockRejectedValueOnce(new Error('offline'));

            const hashes = await library.getRemoteUpdateHashes();

            expect(api.getChartUpdateHashes).toHaveBeenCalledTimes(2);
            expect(Object.keys(hashes)).toHaveLength(500);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('offline'));
            expect(Object.keys(readJson(remoteHashesFile()))).toHaveLength(500);
        });

        it('includes hashes stored after downloads', async () => {
            const library = createLibrary();
            seed(library, ['spinshare_a']);
            library.setRemoteUpdateHash('spinshare_a', 'downloaded');

            const hashes = await library.getRemoteUpdateHashes();

            expect(api.getChartUpdateHashes).not.toHaveBeenCalled();
            expect(hashes).toEqual({ spinshare_a: 'downloaded' });
        });
    });
});
