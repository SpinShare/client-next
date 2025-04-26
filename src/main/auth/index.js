import { NotFoundError } from '@spinshare/api-js';

export class AuthManager {
    static #connectAppApiKey = '78b1b7fdb654100473cb414c104056b2';
    #apiClient = null;
    #settingsManager = null;
    connectToken = null;
    isLoggedIn = false;
    profile = null;

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
}
