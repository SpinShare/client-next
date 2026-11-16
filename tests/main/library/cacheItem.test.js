import { describe, it, expect } from 'vitest';
import { CacheItem } from '../../../src/main/library/cacheItem';
import { DIFFICULTY_TYPES, makeSrtbJson } from './helpers';

describe('CacheItem', () => {
    describe('constructor', () => {
        it('assigns all metadata fields', () => {
            const item = new CacheItem('t', 's', 'a', 'c', true, false, true, false, true, false, 1, 2, 3, 4, 5, 6, 'ref', 'hash', 'ref.srtb');

            expect(item).toMatchObject({
                title: 't',
                subtitle: 's',
                artist: 'a',
                charter: 'c',
                hasEasyDifficulty: true,
                hasNormalDifficulty: false,
                hasHardDifficulty: true,
                hasExpertDifficulty: false,
                hasXDDifficulty: true,
                hasRemiXDDifficulty: false,
                easyDifficulty: 1,
                normalDifficulty: 2,
                hardDifficulty: 3,
                expertDifficulty: 4,
                XDDifficulty: 5,
                remiXDDifficulty: 6,
                fileReference: 'ref',
                updateHash: 'hash',
                srtbPath: 'ref.srtb',
            });
        });

        it('starts without file stats or cover', () => {
            const item = new CacheItem('', '', '', '', false, false, false, false, false, false, 0, 0, 0, 0, 0, 0, '', '', '');

            expect(item.mtimeMs).toBeUndefined();
            expect(item.size).toBeUndefined();
            expect(item.hasCover).toBe(false);
        });
    });

    describe('fromSrtb', () => {
        it('reads the track info', () => {
            const { cacheItem } = CacheItem.fromSrtb(makeSrtbJson({ title: 'Song', subtitle: 'Remix', artist: 'Band', charter: 'Me' }));

            expect(cacheItem.title).toBe('Song');
            expect(cacheItem.subtitle).toBe('Remix');
            expect(cacheItem.artist).toBe('Band');
            expect(cacheItem.charter).toBe('Me');
        });

        it('returns the album art reference', () => {
            const { albumArtReference } = CacheItem.fromSrtb(makeSrtbJson({ albumArt: 'MyCover' }));

            expect(albumArtReference).toBe('MyCover');
        });

        it.each([
            ['easy', DIFFICULTY_TYPES.easy, 'hasEasyDifficulty', 'easyDifficulty'],
            ['normal', DIFFICULTY_TYPES.normal, 'hasNormalDifficulty', 'normalDifficulty'],
            ['hard', DIFFICULTY_TYPES.hard, 'hasHardDifficulty', 'hardDifficulty'],
            ['expert', DIFFICULTY_TYPES.expert, 'hasExpertDifficulty', 'expertDifficulty'],
            ['XD', DIFFICULTY_TYPES.XD, 'hasXDDifficulty', 'XDDifficulty'],
            ['remiXD', DIFFICULTY_TYPES.remiXD, 'hasRemiXDDifficulty', 'remiXDDifficulty'],
        ])('maps the %s difficulty', (_, type, hasKey, ratingKey) => {
            const { cacheItem } = CacheItem.fromSrtb(makeSrtbJson({ difficulties: [{ type, rating: 42 }] }));

            expect(cacheItem[hasKey]).toBe(true);
            expect(cacheItem[ratingKey]).toBe(42);
        });

        it('maps all difficulties of a chart at once', () => {
            const difficulties = Object.values(DIFFICULTY_TYPES).map((type) => ({ type, rating: type * 10 }));
            const { cacheItem } = CacheItem.fromSrtb(makeSrtbJson({ difficulties }));

            expect(cacheItem).toMatchObject({
                easyDifficulty: 20,
                normalDifficulty: 30,
                hardDifficulty: 40,
                expertDifficulty: 50,
                XDDifficulty: 60,
                remiXDDifficulty: 70,
            });
            expect(cacheItem.hasEasyDifficulty && cacheItem.hasNormalDifficulty && cacheItem.hasHardDifficulty && cacheItem.hasExpertDifficulty && cacheItem.hasXDDifficulty && cacheItem.hasRemiXDDifficulty).toBe(true);
        });

        it('ignores inactive difficulties', () => {
            const { cacheItem } = CacheItem.fromSrtb(
                makeSrtbJson({
                    difficulties: [
                        { type: DIFFICULTY_TYPES.easy, rating: 3, active: false },
                        { type: DIFFICULTY_TYPES.hard, rating: 9 },
                    ],
                }),
            );

            expect(cacheItem.hasEasyDifficulty).toBe(false);
            expect(cacheItem.easyDifficulty).toBe(0);
            expect(cacheItem.hasHardDifficulty).toBe(true);
        });

        it('ignores unknown difficulty types', () => {
            const { cacheItem } = CacheItem.fromSrtb(makeSrtbJson({ difficulties: [{ type: 99, rating: 5 }] }));

            expect(cacheItem.hasEasyDifficulty || cacheItem.hasNormalDifficulty || cacheItem.hasHardDifficulty || cacheItem.hasExpertDifficulty || cacheItem.hasXDDifficulty || cacheItem.hasRemiXDDifficulty).toBe(false);
        });

        it('handles charts without difficulties', () => {
            const { cacheItem } = CacheItem.fromSrtb(makeSrtbJson({ difficulties: [] }));

            expect(cacheItem.hasHardDifficulty).toBe(false);
            expect(cacheItem.hardDifficulty).toBe(0);
        });

        it('ignores active difficulties whose track data is missing', () => {
            const srtb = makeSrtbJson({ difficulties: [{ type: DIFFICULTY_TYPES.hard, rating: 7 }] });
            srtb.largeStringValuesContainer.values = srtb.largeStringValuesContainer.values.filter((value) => !value.key.includes('TrackData'));

            const { cacheItem } = CacheItem.fromSrtb(srtb);

            expect(cacheItem.hasHardDifficulty).toBe(false);
        });

        it('leaves file specific fields empty', () => {
            const { cacheItem } = CacheItem.fromSrtb(makeSrtbJson());

            expect(cacheItem.fileReference).toBe('');
            expect(cacheItem.updateHash).toBe('');
            expect(cacheItem.srtbPath).toBe('');
        });

        it('handles charts without an album art reference', () => {
            const { cacheItem, albumArtReference } = CacheItem.fromSrtb(makeSrtbJson({ albumArt: null }));

            expect(cacheItem.title).toBe('Title');
            expect(albumArtReference).toBeUndefined();
        });
    });
});
