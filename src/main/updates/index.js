import { app } from 'electron';
import { EventEmitter } from 'events';

export class UpdateManager extends EventEmitter {
    constructor(settingsManager) {
        super();

        this.url = `https://api.github.com/repos/SpinShare/client-next/releases`;
        this.settingsManager = settingsManager;
    }

    async checkForUpdates() {
        let data;

        try {
            const response = await fetch(this.url, { signal: AbortSignal.timeout(10000) });

            // Failsafe if we get rate-limited or Github is down
            if (!response.ok) {
                console.warn(`[UpdateManager] Update check failed with status ${response.status}.`);
                return false;
            }

            data = await response.json();
        } catch (error) {
            // Failsafe if the user is offline or Github is unreachable
            console.warn(`[UpdateManager] Update check failed: ${error.message}`);
            return false;
        }

        if (!Array.isArray(data)) {
            return false;
        }

        const latestRelease = data.find((r) => r.prerelease === false) || null;
        const hasNewRelease = !latestRelease?.name?.includes(app.getVersion()) || false;

        this.settingsManager.updateOrInsert('updateAvailable', hasNewRelease);
        this.emit('update-check-done', hasNewRelease);

        if (hasNewRelease) {
            console.log(`[UpdateManager] New update available: ${latestRelease.name}`);
        } else {
            console.log(`[UpdateManager] No new update available.`);
        }

        return hasNewRelease;
    }
}
