import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { SpinShareClient } from '@spinshare/api-js';
import { setupApiHandlers } from './main/api';
import * as Sentry from '@sentry/electron/main';
import { DownloadQueue } from './main/queue';
import { SettingsManager } from './main/settings';
import { AuthManager } from './main/auth';

Sentry.init({
    dsn: 'https://d1445074964dee4d6d1b2d9f1bae8a7b@o1420803.ingest.us.sentry.io/4509152324222976',
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const settingsManager = new SettingsManager();
const downloadQueue = new DownloadQueue();

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 850,
        minWidth: 750,
        minHeight: 600,
        webPreferences: {
            // eslint-disable-next-line no-undef
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#1e1f24',
        autoHideMenuBar: true,
    });

    // eslint-disable-next-line no-undef
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        // eslint-disable-next-line no-undef
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        // eslint-disable-next-line no-undef
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Open external urls in browser
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('http://localhost') && !url.startsWith('https://localhost')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });
    // Disable middle click
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
};

app.whenReady().then(() => {
    createWindow();

    const apiClient = new SpinShareClient();
    const authManager = new AuthManager(settingsManager, apiClient);
    setupApiHandlers(apiClient);

    /* Queue */
    ipcMain.handle('get-queue-hasitems', async (event) => {
        return downloadQueue.hasPendingItems();
    });
    ipcMain.handle('add-queue-item', async (event, item) => {
        return downloadQueue.addItem(item);
    });
    ipcMain.handle('remove-queue-item', async (event, itemId) => {
        return downloadQueue.removeItem(itemId);
    });

    /* External */
    ipcMain.handle('open-url', async (event, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening URL:', error);
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle('open-folder', async (event, folderPath) => {
        try {
            await shell.openPath(folderPath);
            return { success: true };
        } catch (error) {
            console.error('Error opening folder:', error);
            return { success: false, error: error.message };
        }
    });

    /* SettingsManager */
    ipcMain.handle('get-settings-all', (event) => {
        return settingsManager.settings;
    });
    ipcMain.handle('get-settings', (event, key) => {
        return settingsManager.get(key);
    });
    ipcMain.handle('set-settings', (event, key, value) => {
        return settingsManager.updateOrInsert(key, value);
    });
    ipcMain.handle('reset-settings-all', (event) => {
        return settingsManager.resetAll();
    });
    ipcMain.handle('reset-settings', (event, key) => {
        return settingsManager.reset(key);
    });
    ipcMain.handle('save-settings', (event) => {
        return settingsManager.save();
    });
    ipcMain.handle('load-settings', (event) => {
        return settingsManager.load();
    });
    ipcMain.handle('get-default-customs-path', (event) => {
        return SettingsManager.getDefaultCustomsPath();
    });

    /* Auth */
    ipcMain.handle('connect-validate-token', async (event) => {
        return await authManager.validateToken();
    });
    ipcMain.handle('connect-login', async (event, connectCode) => {
        return await authManager.login(connectCode);
    });
    ipcMain.handle('connect-logout', async (event) => {
        return authManager.logout();
    });
    ipcMain.handle('connect-get-profile', async (event) => {
        return await authManager.getProfile();
    });
    ipcMain.handle('connect-is-logged-in', (event) => {
        return authManager.isLoggedIn;
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // eslint-disable-next-line no-undef
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
