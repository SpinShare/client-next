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
     * @param {boolean} force - Download even if the installed chart is up to date
     */
    constructor(id, cover, title, artist, charter, fileReference, force = false) {
        this.id = id;
        this.cover = cover;
        this.title = title;
        this.artist = artist;
        this.charter = charter;
        this.fileReference = fileReference;
        this.force = force;
        this.state = 0;
    }
}
