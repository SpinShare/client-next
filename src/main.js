import { app, BrowserWindow, ipcMain, shell, dialog, clipboard } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import { SpinShareClient } from '@spinshare/api-js';
import { setupApiHandlers } from './main/api';
import * as Sentry from '@sentry/electron/main';
import { DownloadQueue } from './main/queue';
import { SettingsManager } from './main/settings';
import { AuthManager } from './main/auth';
import { LibraryManager } from './main/library';
import { URL } from 'url';
import { UpdateManager } from './main/updates';

Sentry.init({
    dsn: 'https://d1445074964dee4d6d1b2d9f1bae8a7b@o1420803.ingest.us.sentry.io/4509152324222976',
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

// Register the spinshare:// protocol
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('spinshare', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('spinshare');
}

// Only allow a single instance of the app
const gotTheLock = app.requestSingleInstanceLock();
let mainWindow = null;

if (!gotTheLock) {
    app.quit();
} else {
    // Someone tried to run a second instance, focus our window instead
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Handle the protocol URL if it exists
        const deepLinkUrl = getDeepLinkUrl(commandLine);
        if (deepLinkUrl) {
            handleDeepLink(deepLinkUrl);
        }

        // Focus the main window if it exists
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

const settingsManager = new SettingsManager();

// Function to extract the deep link URL from command line arguments
function getDeepLinkUrl(argv) {
    // Check for spinshare:// protocol URLs in the arguments
    const deepLinkUrl = argv.find((arg) => arg.startsWith('spinshare://'));
    return deepLinkUrl || null;
}

// Function to handle deep link navigation
function handleDeepLink(url) {
    if (!mainWindow) return;

    try {
        const parsedUrl = new URL(url);

        // Only handle spinshare:// URLs
        if (parsedUrl.protocol !== 'spinshare:') {
            console.log(`Not a spinshare:// URL: ${url}`);
            return false;
        }

        // Remove leading slash
        let pathname = parsedUrl.pathname;
        if (pathname.startsWith('/')) {
            pathname = pathname.substring(1);
        }
        const type = parsedUrl.hostname;

        switch (type) {
            default:
                console.error(`[DeepLink] Unknown deep link type: ${url} - ${type} - ${pathname}`);
                return false;
            case 'chart':
                mainWindow.webContents.send('navigate-to', `/chart/${pathname}`);
                return true;
            case 'user':
                mainWindow.webContents.send('navigate-to', `/user/${pathname}`);
                return true;
            case 'playlist':
                mainWindow.webContents.send('navigate-to', `/playlist/${pathname}`);
                return true;
        }
    } catch (error) {
        console.error(`Error handling deep link ${url}:`, error);
        return false;
    }
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 850,
        minWidth: 750,
        minHeight: 600,
        icon: path.join(__dirname, '../renderer/assets/images/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#1e1f24',
        autoHideMenuBar: true,
    });

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    if (process.env.NODE_ENV === 'development') {
        mainWindow.on('ready-to-show', () => {
            mainWindow.webContents.openDevTools();
        });
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

    return mainWindow;
};

// Handle protocol URLs on macOS
app.on('open-url', (event, url) => {
    event.preventDefault();

    if (url.startsWith('spinshare://')) {
        // If the app is not ready yet, wait until it is
        if (!app.isReady()) {
            app.once('ready', () => {
                handleDeepLink(url);
            });
        } else {
            handleDeepLink(url);
        }
    }
});

app.whenReady().then(() => {
    mainWindow = createWindow();

    // Handle protocol URLs on Windows/Linux from startup
    const deepLinkUrl = getDeepLinkUrl(process.argv);
    if (deepLinkUrl) {
        handleDeepLink(deepLinkUrl);
    }

    const apiClient = new SpinShareClient();
    const authManager = new AuthManager(settingsManager, apiClient);
    setupApiHandlers(apiClient);

    /* Updates */
    const updateManager = new UpdateManager(settingsManager);
    updateManager.on('update-check-done', (hasNewRelease) => {
        mainWindow.webContents.send('update-check-done', hasNewRelease);
    });
    ipcMain.handle('check-for-updates', async (event) => {
        return await updateManager.checkForUpdates();
    });
    ipcMain.handle('get-app-version', (event) => {
        return `${app.getVersion()}-${process.env.NODE_ENV || 'production'}`;
    });

    /* Library */
    const library = new LibraryManager(apiClient, settingsManager);
    library.on('cache-change', () => {
        mainWindow.webContents.send('cache-change', library.items);
    });
    library.on('cache-rebuild-start', () => {
        mainWindow.webContents.send('cache-rebuild-start');
    });
    library.on('cache-rebuild-progress', (status) => {
        mainWindow.webContents.send('cache-rebuild-progress', status);
    });
    library.on('cache-rebuild-done', () => {
        mainWindow.webContents.send('cache-rebuild-done');
    });
    ipcMain.handle('get-library-all', async (event) => {
        return library.items;
    });
    ipcMain.handle('get-library', async (event, fileReference) => {
        return library.get(fileReference);
    });
    ipcMain.handle('get-library-update-hash', async (event, fileReference) => {
        return library.getUpdateHash(fileReference);
    });
    ipcMain.handle('get-library-thumbnail', async (event, fileReference) => {
        return await library.getThumbnailAsBase64(fileReference);
    });
    ipcMain.handle('rebuild-library', async (event) => {
        await library.rebuild();
    });

    /* Queue */
    const downloadQueue = new DownloadQueue(apiClient, settingsManager, library, app.getPath('temp'));
    downloadQueue.on('queue-change', (queueItems) => {
        mainWindow.webContents.send('queue-change', queueItems);
    });
    downloadQueue.on('queue-count-change', (queueCount) => {
        mainWindow.webContents.send('queue-count-change', queueCount);
    });
    downloadQueue.on('item-change', (queueItem) => {
        mainWindow.webContents.send('item-change', queueItem);
    });
    downloadQueue.on('item-add', (queueItem) => {
        mainWindow.webContents.send('item-add', queueItem);
    });
    downloadQueue.on('queue-done', () => {
        mainWindow.webContents.send('queue-done');
    });
    ipcMain.handle('add-queue-item', async (event, item) => {
        return downloadQueue.addItem(item);
    });
    ipcMain.handle('remove-queue-item', async (event, itemId) => {
        return downloadQueue.removeItem(itemId);
    });
    ipcMain.handle('get-queue-items', async (event) => {
        return downloadQueue.items;
    });
    ipcMain.handle('get-queue-count', async (event) => {
        return downloadQueue.pendingItemsCount();
    });
    ipcMain.handle('clear-queue-done', async (event) => {
        return downloadQueue.clearDone();
    });
    ipcMain.handle('queue-restart-failed', async (event) => {
        return downloadQueue.restartFailed();
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
    ipcMain.handle('folder-exists', async (event, folderPath) => {
        try {
            return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
        } catch (error) {
            console.error('Error checking folder existence:', error);
            return false;
        }
    });
    ipcMain.handle('show-dialog', async (event, options) => {
        await dialog.showMessageBox(mainWindow, options);
    });
    ipcMain.handle('select-folder', async (event, folderPath) => {
        try {
            const selectedFolderPath = await dialog.showOpenDialog({
                properties: ['openDirectory'],
                defaultPath: folderPath || app.getPath('home'),
                title: 'Select folder',
                message: 'Select the folder to open',
                buttonLabel: 'Open',
            });
            return selectedFolderPath.filePaths[0] || null;
        } catch (error) {
            console.error('Error selecting folder:', error);
            return null;
        }
    });
    ipcMain.handle('copy-text', async (event, text) => {
        try {
            clipboard.writeText(text);
        } catch (error) {
            console.error('Error copying text:', error);
        }
    });
    app.on('browser-window-focus', (event) => {
        mainWindow.webContents.send('window-focused');
    });
    app.on('browser-window-blur', (event) => {
        mainWindow.webContents.send('window-blurred');
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
    ipcMain.handle('save-settings-all', (event, settings) => {
        settingsManager.settings = settings;
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
    ipcMain.handle('connect-get-playlists', async (event) => {
        return await authManager.getPlaylists();
    });
    ipcMain.handle('connect-get-notifications', async (event) => {
        return await authManager.getNotifications();
    });
    ipcMain.handle('connect-clear-notification', async (event, notificationId) => {
        return await authManager.clearNotification(notificationId);
    });
    ipcMain.handle('connect-clear-all-notifications', async (event) => {
        return await authManager.clearAllNotifications();
    });
    ipcMain.handle('connect-get-review', async (event, chartId) => {
        return await authManager.getReview(chartId);
    });
    ipcMain.handle('connect-add-review', async (event, chartId, recommended, comment) => {
        return await authManager.addReview(chartId, recommended, comment);
    });
    ipcMain.handle('connect-remove-review', async (event, chartId) => {
        return await authManager.removeReview(chartId);
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
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
