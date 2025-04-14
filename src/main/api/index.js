import { setupPromosApiHandlers } from './promos';
import { setupPlaylistsApiHandlers } from './playlists';
import { setupChartsApiHandlers } from './charts';
import { setupDiscoverApiHandlers } from './discover';
import { setupClientApiHandlers } from './client';

export function setupApiHandlers(apiClient) {
    setupClientApiHandlers(apiClient);
    setupPromosApiHandlers(apiClient);
    setupPlaylistsApiHandlers(apiClient);
    setupChartsApiHandlers(apiClient);
    setupDiscoverApiHandlers(apiClient);
}
