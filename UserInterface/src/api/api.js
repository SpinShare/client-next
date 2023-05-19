async function getData(endpoint) {
    const res = await fetch('https://spinsha.re/api/' + endpoint);
    const body = await res.json();

    if(body.version !== 1) {
        console.error("API version mismatch");
        return null;
    }

    if(body.status !== 200) {
        console.error(body.status);
        return null;
    }
    
    return body.data;
}

export async function getPromos() {
    return await getData('promos') ?? [];
}

export async function getPlaylist(playlistId) {
    return await getData('playlist/' + playlistId) ?? null;
}