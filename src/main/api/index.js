import { setupPromosApiHandlers } from './promos';
import { setupPlaylistsApiHandlers } from './playlists';
import { setupChartsApiHandlers } from './charts';
import { setupDiscoverApiHandlers } from './discover';
import { setupUserApiHandlers } from './user';

export function setupApiHandlers(apiClient) {
    setupPromosApiHandlers(apiClient);
    setupPlaylistsApiHandlers(apiClient);
    setupChartsApiHandlers(apiClient);
    setupDiscoverApiHandlers(apiClient);
    setupUserApiHandlers(apiClient);
}
