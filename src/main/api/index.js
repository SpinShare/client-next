import { setupPromosApiHandlers } from './promos';
import { setupPlaylistsApiHandlers } from './playlists';

export function setupApiHandlers(apiClient) {
    setupPromosApiHandlers(apiClient);
    setupPlaylistsApiHandlers(apiClient);
}
