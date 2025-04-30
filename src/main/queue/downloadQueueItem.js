/**
 * Represents a downloadable item with associated metadata.
 */
export class DownloadItem {
    /**
     * @param {string} id
     * @param {string} cover
     * @param {string} title
     * @param {string} artist
     * @param {string} charter
     * @param {number} state
     */
    constructor(id, cover, title, artist, charter) {
        this.id = id;
        this.cover = cover;
        this.title = title;
        this.artist = artist;
        this.charter = charter;
        this.state = 0;
    }
}
