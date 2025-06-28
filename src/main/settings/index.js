import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

export class SettingsManager {
    constructor() {
        this.defaults = {
            setupCompleted: false,
            theme: 'dark',
            language: 'en',
            downloadNotifications: false,
            openDownloadsSidebar: false,
            connectToken: false,
            showExplicit: false,
            sfxEnabled: true,
            musicEnabled: true,
            pathCustoms: SettingsManager.getDefaultCustomsPath(),
            pathGame: '',
        };
        this.settings = { ...this.defaults };

        this.settingsPath = path.join(app.getPath('userData'), 'SpinShare', 'settings.json');
        if (!fs.existsSync(this.settingsPath)) {
            fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true });
            this.save();
        }

        this.load();
    }

    updateOrInsert(key, value) {
        this.settings[key] = value;
        this.save();
    }

    get(key) {
        return this.settings[key] !== undefined ? this.settings[key] : this.defaults[key];
    }

    delete(key) {
        delete this.settings[key];
    }

    reset(key) {
        this.settings[key] = this.defaults[key];
    }

    resetAll() {
        console.log(`[SettingsManager] Resetting settings`);
        this.settings = { ...this.defaults };
    }

    save() {
        console.log(`[SettingsManager] Saving settings`);
        fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings), 'utf-8');
    }

    load() {
        console.log(`[SettingsManager] Loading settings`);
        const loadedSettings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8'));
        this.settings = { ...this.defaults, ...loadedSettings };
    }

    static getSystem() {
        return process.platform;
    }

    static getDefaultCustomsPath() {
        const system = this.getSystem();

        if (system === 'win32') {
            return path.join(app.getPath('userData'), '../..', 'LocalLow', 'Super Spin Digital', 'Spin Rhythm XD', 'Custom');
        }
        if (system === 'darwin') {
            return path.join(app.getPath('appData'), 'Super Spin Digital', 'Spin Rhythm XD', 'Custom');
        }
        if (system === 'linux') {
            const linuxHomedir = homedir();
            return path.join(linuxHomedir, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '1058830', 'pfx', 'drive_c', 'users', 'steamuser', 'AppData', 'LocalLow', 'Super Spin Digital', 'Spin Rhythm XD', 'Custom');

            // TODO: Native Linux build path
        }
    }
}
