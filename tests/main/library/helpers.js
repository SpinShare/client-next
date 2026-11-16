import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DIFFICULTY_TYPES = { easy: 2, normal: 3, hard: 4, expert: 5, XD: 6, remiXD: 7 };

/**
 * Builds a minimal srtb object as written by the game
 * @param {Object} options
 * @param {string} [options.title]
 * @param {string} [options.subtitle]
 * @param {string} [options.artist]
 * @param {string} [options.charter]
 * @param {string|null} [options.albumArt] assetName of the album art, null for no reference
 * @param {Array<{type: number, rating: number, active?: boolean}>} [options.difficulties]
 * @returns {Object}
 */
export function makeSrtbJson({ title = 'Title', subtitle = 'Subtitle', artist = 'Artist', charter = 'Charter', albumArt = 'cover', difficulties = [{ type: DIFFICULTY_TYPES.hard, rating: 7 }] } = {}) {
    const trackInfo = {
        title,
        subtitle,
        artistName: artist,
        charter,
        albumArtReference: albumArt === null ? undefined : { assetName: albumArt },
        difficulties: difficulties.map((difficulty, i) => ({ _active: difficulty.active ?? true, assetName: `Diff${i}` })),
    };

    return {
        largeStringValuesContainer: {
            values: [
                { key: 'SO_TrackInfo_TrackInfo', val: JSON.stringify(trackInfo) },
                ...difficulties.map((difficulty, i) => ({
                    key: `SO_TrackData_Diff${i}`,
                    val: JSON.stringify({ difficultyType: difficulty.type, difficultyRating: difficulty.rating }),
                })),
            ],
        },
    };
}

/**
 * @param {Object} [options] see makeSrtbJson
 * @returns {string}
 */
export function makeSrtb(options) {
    return JSON.stringify(makeSrtbJson(options));
}

/**
 * Creates a temporary directory with a userData folder and a customs folder (incl. AlbumArt)
 * @returns {{root: string, userData: string, customs: string, cache: string, cleanup: function(): void}}
 */
export function makeTempDirs() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spinshare-library-test-'));
    const userData = path.join(root, 'userData');
    const customs = path.join(root, 'customs');
    fs.mkdirSync(path.join(customs, 'AlbumArt'), { recursive: true });

    return {
        root,
        userData,
        customs,
        cache: path.join(userData, 'SpinShare', 'cache'),
        cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
    };
}
