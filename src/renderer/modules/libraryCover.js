/**
 * Returns the URL of a library chart's cached thumbnail
 * @param {string} fileReference
 * @param {string} [version] Cache busting
 * @returns {string}
 */
export function getLibraryCoverUrl(fileReference, version = '') {
    const url = `spinshare-cover://thumbnail/${encodeURIComponent(fileReference)}`;
    return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}
