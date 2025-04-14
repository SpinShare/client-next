import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { SpinShareClient } from '@spinshare/api-js';
import { setupApiHandlers } from './main/api';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 850,
        minWidth: 750,
        minHeight: 600,
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
        mainWindow.webContents.openDevTools();
    }
};

app.whenReady().then(() => {
    createWindow();

    const apiClient = new SpinShareClient();
    setupApiHandlers(apiClient);

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
