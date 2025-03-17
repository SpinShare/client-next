import { setupPromosApiHandlers } from './promos';
import { setupPlaylistsApiHandlers } from './playlists';
import {setupChartsApiHandlers} from "./charts";

export function setupApiHandlers(apiClient) {
    setupPromosApiHandlers(apiClient);
    setupPlaylistsApiHandlers(apiClient);
    setupChartsApiHandlers(apiClient);
}
