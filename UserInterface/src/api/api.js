export const SUPPORTED_VERSION = 1;
export const FEATURED_PLAYLIST_ID = 144;

async function getData(endpoint, data = null) {
    let res;
    if(data !== null) {
        res = await fetch('https://spinsha.re/api/' + endpoint, {
            method: 'POST',
            body: JSON.stringify(data) ?? null
        });
    } else {
        res = await fetch('https://spinsha.re/api/' + endpoint);
    }
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

export async function getUser(userId) {
    console.log("[API] getUser " + userId);
    return await getData('user/' + userId) ?? null;
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

export async function getChartPlaylists(chartId) {
    console.log("[API] getChartPlaylists " + chartId);
    return await getData('song/' + chartId + '/playlists') ?? [];
}

export async function getChartSpinPlays(chartId) {
    console.log("[API] getChartSpinPlays " + chartId);
    return await getData('song/' + chartId + '/spinplays') ?? [];
}

export async function searchUsers(query) {
    console.log("[API] searchUsers " + query);
    return await getData('searchUsers', {
        searchQuery: query,
    }) ?? [];
}

export async function searchPlaylists(query) {
    console.log("[API] searchPlaylists " + query);
    return await getData('searchPlaylists', {
        searchQuery: query,
    }) ?? [];
}

export async function searchCharts(query, filters) {
    console.log("[API] searchCharts " + query);
    return await getData('searchCharts', {
        searchQuery: query,
        diffEasy: filters?.diffEasy ?? null,
        diffNormal: filters?.diffNormal ?? null,
        diffHard: filters?.diffHard ?? null,
        diffExpert: filters?.diffExpert ?? null,
        diffXD: filters?.diffXD ?? null,
        diffRatingFrom: filters?.diffRatingFrom ?? null,
        diffRatingTo: filters?.diffRatingTo ?? null,
        showExplicit: filters?.showExplicit ?? null,
    }) ?? [];
}