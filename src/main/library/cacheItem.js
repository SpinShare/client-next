/**
 * Represents a cache item with relevant metadata.
 */
export class CacheItem {
    /**
     * @param {string} title
     * @param {string} subtitle
     * @param {string} artist
     * @param {string} charter
     * @param {boolean} hasEasyDifficulty
     * @param {boolean} hasNormalDifficulty
     * @param {boolean} hasHardDifficulty
     * @param {boolean} hasExtremeDifficulty
     * @param {boolean} hasXDDifficulty
     * @param {number} easyDifficulty
     * @param {number} normalDifficulty
     * @param {number} hardDifficulty
     * @param {number} expertDifficulty
     * @param {number} XDDifficulty
     * @param {string} fileReference
     * @param {string} updateHash
     * @param {string} srtbPath
     */
    constructor(title, subtitle, artist, charter, hasEasyDifficulty, hasNormalDifficulty, hasHardDifficulty, hasExtremeDifficulty, hasXDDifficulty, easyDifficulty, normalDifficulty, hardDifficulty, expertDifficulty, XDDifficulty, fileReference, updateHash, srtbPath) {
        this.title = title;
        this.subtitle = subtitle;
        this.artist = artist;
        this.charter = charter;
        this.hasEasyDifficulty = hasEasyDifficulty;
        this.hasNormalDifficulty = hasNormalDifficulty;
        this.hasHardDifficulty = hasHardDifficulty;
        this.hasExtremeDifficulty = hasExtremeDifficulty;
        this.hasXDDifficulty = hasXDDifficulty;
        this.easyDifficulty = easyDifficulty;
        this.normalDifficulty = normalDifficulty;
        this.hardDifficulty = hardDifficulty;
        this.expertDifficulty = expertDifficulty;
        this.XDDifficulty = XDDifficulty;
        this.fileReference = fileReference;
        this.updateHash = updateHash;
        this.srtbPath = srtbPath;
    }

    static fromSrtb(srtbJson) {
        let trackInfoContainer = {};
        const activeTrackDataContainers = [];
        const trackDataContainers = [];
        const cacheItem = new CacheItem('', '', '', '', false, false, false, false, false, 0, 0, 0, 0, 0, '', '');

        // Get TrackInfoContainer
        srtbJson.largeStringValuesContainer.values.forEach((rawContainer) => {
            if (rawContainer.key.includes('TrackInfo')) {
                trackInfoContainer = JSON.parse(rawContainer.val);

                trackInfoContainer.difficulties.forEach((difficulty) => {
                    if (difficulty._active) {
                        activeTrackDataContainers.push(`SO_TrackData_${difficulty.assetName}`);
                    }
                });
            }
        });

        // Get Active TrackDataContainers
        srtbJson.largeStringValuesContainer.values.forEach((rawContainer) => {
            if (rawContainer.key.includes('TrackData') && activeTrackDataContainers.includes(rawContainer.key)) {
                trackDataContainers.push(JSON.parse(rawContainer.val));
            }
        });

        cacheItem.title = trackInfoContainer.title;
        cacheItem.subtitle = trackInfoContainer.subtitle;
        cacheItem.artist = trackInfoContainer.artistName;
        cacheItem.charter = trackInfoContainer.charter;
        cacheItem.hasEasyDifficulty = false;
        cacheItem.hasNormalDifficulty = false;
        cacheItem.hasHardDifficulty = false;
        cacheItem.hasExtremeDifficulty = false;
        cacheItem.hasXDDifficulty = false;
        cacheItem.easyDifficulty = 0;
        cacheItem.normalDifficulty = 0;
        cacheItem.hardDifficulty = 0;
        cacheItem.expertDifficulty = 0;
        cacheItem.XDDifficulty = 0;
        cacheItem.srtbPath = "";

        trackDataContainers.forEach((container) => {
            switch (container.difficultyType) {
                case 2:
                    cacheItem.hasEasyDifficulty = true;
                    cacheItem.easyDifficulty = container.difficultyRating;
                    break;
                case 3:
                    cacheItem.hasNormalDifficulty = true;
                    cacheItem.normalDifficulty = container.difficultyRating;
                    break;
                case 4:
                    cacheItem.hasHardDifficulty = true;
                    cacheItem.hardDifficulty = container.difficultyRating;
                    break;
                case 5:
                    cacheItem.hasExtremeDifficulty = true;
                    cacheItem.expertDifficulty = container.difficultyRating;
                    break;
                case 6:
                    cacheItem.hasXDDifficulty = true;
                    cacheItem.XDDifficulty = container.difficultyRating;
                    break;
            }
        });

        return {
            cacheItem: cacheItem,
            albumArtReference: trackInfoContainer.albumArtReference.assetName,
        };
    }
}
