import { describe, it, expect } from 'vitest';
import { getLibraryCoverUrl } from '@/modules/libraryCover';

describe('getLibraryCoverUrl', () => {
    it('builds a spinshare-cover URL for the fileReference', () => {
        expect(getLibraryCoverUrl('spinshare_abc')).toBe('spinshare-cover://thumbnail/spinshare_abc');
    });

    it('appends the version to bust the image cache', () => {
        expect(getLibraryCoverUrl('spinshare_abc', 'hash123')).toBe('spinshare-cover://thumbnail/spinshare_abc?v=hash123');
    });

    it('encodes special characters', () => {
        const url = getLibraryCoverUrl('my chart#1/..', 'a&b');

        expect(url).toBe('spinshare-cover://thumbnail/my%20chart%231%2F..?v=a%26b');
        expect(decodeURIComponent(new URL(url).pathname.slice(1))).toBe('my chart#1/..');
    });
});
