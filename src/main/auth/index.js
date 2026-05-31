import { NotFoundError } from '@spinshare/api-js';

export class AuthManager {
    static #connectAppApiKey = '78b1b7fdb654100473cb414c104056b2';
    #apiClient = null;
    #settingsManager = null;
    connectToken = null;
    isLoggedIn = false;
    profile = null;
    #notificationsCache = null;
    #notificationsCacheTime = 0;

    constructor(settingsManager, apiClient) {
        this.#settingsManager = settingsManager;
        this.#apiClient = apiClient;

        (async () => {
            this.connectToken = this.#settingsManager.get('connectToken');
            if (this.connectToken) {
                console.log(`[AuthManager] Validate existing token.`);
                await this.fetchProfile();
            }
        })();
    }

    async validateToken() {
        if (!this.#apiClient) return false;
        if (!this.connectToken) return false;

        try {
            const response = await this.#apiClient.connectValidateToken(this.connectToken);

            if (response) {
                this.isLoggedIn = true;
                return true;
            }
        } catch (e) {
            console.log(e.message);
        }

        this.logout();

        return false;
    }

    async login(connectCode) {
        try {
            const response = await this.#apiClient.connectGetToken(AuthManager.#connectAppApiKey, connectCode);

            this.isLoggedIn = true;
            this.connectToken = response;
            this.#settingsManager.updateOrInsert('connectToken', response);

            console.log(`[AuthManager] Successfully connected.`);
            return true;
        } catch (e) {
            if (e instanceof NotFoundError) {
                console.log(`[AuthManager] Connect code was wrong.`);
                return false;
            } else {
                console.log(`[AuthManager] Internal server error.`);
                return null;
            }
        }
    }

    logout() {
        this.isLoggedIn = false;
        this.connectToken = null;
        this.#settingsManager.updateOrInsert('connectToken', null);
        this.profile = null;
        this.#notificationsCache = null;
        this.#notificationsCacheTime = 0;
    }

    async fetchProfile() {
        if (!this.#apiClient) return null;
        if (!this.isLoggedIn) {
            await this.validateToken();

            if (!this.isLoggedIn) return null;
        }

        try {
            return await this.#apiClient.connectGetProfile(this.connectToken);
        } catch (e) {
            console.error(e.message);
            this.logout();
            return null;
        }
    }

    async getProfile() {
        if (!this.isLoggedIn) return null;
        if (this.profile) return this.profile;

        this.profile = await this.fetchProfile();
        return this.profile;
    }

    async getPlaylists() {
        if (!this.isLoggedIn) return null;

        try {
            return await this.#apiClient.connectGetPlaylists(this.connectToken);
        } catch (e) {
            console.error(e.message);
            return [];
        }
    }

    async getNotifications() {
        if (!this.isLoggedIn) return null;

        const ONE_HOUR = 60 * 60 * 1000;
        if (this.#notificationsCache !== null && Date.now() - this.#notificationsCacheTime < ONE_HOUR) {
            return this.#notificationsCache;
        }

        try {
            this.#notificationsCache = await this.#apiClient.connectGetNotifications(this.connectToken);
            this.#notificationsCacheTime = Date.now();
            return this.#notificationsCache;
        } catch (e) {
            console.error(e.message);
            return [];
        }
    }

    async clearNotification(notificationId) {
        if (!this.isLoggedIn) return null;

        this.#notificationsCacheTime = 0;

        try {
            return await this.#apiClient.connectClearNotification(this.connectToken, notificationId);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    }

    async clearAllNotifications() {
        if (!this.isLoggedIn) return null;

        this.#notificationsCacheTime = 0;

        try {
            return await this.#apiClient.connectClearAllNotifications(this.connectToken);
        } catch (e) {
            console.error(e.message);
            return null;
        }
    }

    async getReview(chartId) {
        if (!this.isLoggedIn) return null;

        try {
            return await this.#apiClient.connectGetReview(this.connectToken, chartId);
        } catch (e) {
            console.error(e.message);
            return [];
        }
    }

    async addReview(chartId, recommended, comment) {
        if (!this.isLoggedIn) return null;

        try {
            return await this.#apiClient.connectAddReview(this.connectToken, chartId, recommended, comment);
        } catch (e) {
            console.error(e.message);
            return [];
        }
    }

    async removeReview(chartId) {
        if (!this.isLoggedIn) return null;

        try {
            return await this.#apiClient.connectRemoveReview(this.connectToken, chartId);
        } catch (e) {
            console.error(e.message);
            return [];
        }
    }
}
