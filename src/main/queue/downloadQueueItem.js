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
     * @param {string} fileReference
     */
    constructor(id, cover, title, artist, charter, fileReference) {
        this.id = id;
        this.cover = cover;
        this.title = title;
        this.artist = artist;
        this.charter = charter;
        this.fileReference = fileReference;
        this.state = 0;
    }
}
