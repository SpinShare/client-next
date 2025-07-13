import {app} from "electron";
import {EventEmitter} from "events";

export class UpdateManager extends EventEmitter {
    constructor(settingsManager) {
        super();

        this.url = `https://api.github.com/repos/SpinShare/client-next/releases`;
        this.settingsManager = settingsManager;
    }

    async checkForUpdates() {
        const response = await fetch(this.url);
        const data = await response.json();

        // Failsafe if we get rate-limited or Github is down
        if(!response.ok) {
            return false;
        }

        const latestRelease = data.find(r => r.prerelease === false) || null;
        const hasNewRelease = latestRelease?.name?.includes(app.getVersion()) || false;

        this.settingsManager.updateOrInsert('updateAvailable', hasNewRelease);
        this.emit('update-check-done', hasNewRelease);

        if(hasNewRelease) {
            console.log(`[UpdateManager] New update available: ${latestRelease.name}`);
        } else {
            console.log(`[UpdateManager] No new update available.`);
        }

        return hasNewRelease;
    }
}