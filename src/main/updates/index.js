import {app} from "electron";

export class UpdateManager {
    updateAvailable = false;
    githubUser = "SpinShare";
    githubRepo = "client-next";
    url = "";
    settingsManager = null;

    constructor(settingsManager) {
        this.url = `https://api.github.com/repos/${this.githubUser}/${this.githubRepo}/releases`;
        this.settingsManager = settingsManager;
    }

    async getLatestRelease() {
        const response = await fetch(this.url);
        const data = await response.json();
        const latestRelease = data.find(r => r.prerelease === false) || null;
        const hasNewRelease = latestRelease?.name?.includes(app.getVersion()) || false;

        this.settingsManager.updateOrInsert('updateAvailable', hasNewRelease);

        if(hasNewRelease) {
            console.log(`[UpdateManager] New update available: ${latestRelease.name}`);
        } else {
            console.log(`[UpdateManager] No new update available.`);
        }
    }
}