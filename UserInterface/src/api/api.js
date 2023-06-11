export const SUPPORTED_VERSION = 1;
export const FEATURED_PLAYLIST_ID = 144;

async function getData(endpoint) {
    const res = await fetch('https://spinsha.re/api/' + endpoint);
    const body = await res.json();

    if(body.version !== SUPPORTED_VERSION) {
        console.error(`[API] Version Mismatch (Got ${body.version}, needed ${SUPPORTED_VERSION})`);
        return null;
    }

    if(body.status !== 200) {
        console.error(body.status);
        return null;
    }
    
    return body.data;
}

export async function getPromos() {
    console.log("[API] getPromos");
    return await getData('promos') ?? [];
}

export async function getChart(chartId) {
    console.log("[API] getChart " + chartId);
    return await getData('song/' + chartId) ?? null;
}

export async function getPlaylist(playlistId) {
    console.log("[API] getPlaylist " + playlistId);
    return await getData('playlist/' + playlistId) ?? null;
}

export async function getChartReviews(chartId) {
    console.log("[API] getChartReviews " + chartId);
    return await getData('song/' + chartId + '/reviews') ?? [];
}

export async function getChartSpinPlays(chartId) {
    console.log("[API] getChartSpinPlays " + chartId);
    return await getData('song/' + chartId + '/spinplays') ?? [];
}