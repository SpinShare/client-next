// Test script for spinshare:// protocol in development mode on Linux
const { exec } = require('child_process');
const path = require('path');

// URL to test - change this to test different routes
const testUrl = 'spinshare://chart/154';

// Check if the app is already running
const isAppRunning = () => {
    return new Promise((resolve) => {
        exec('pgrep -f "electron.*spinshare-client-next"', (error, stdout) => {
            if (error && error.code !== 1) {
                console.error(`Error checking if app is running: ${error}`);
                resolve(false);
                return;
            }

            // If we found a process ID, the app is running
            resolve(stdout.trim() !== '');
        });
    });
};

// Start the app in development mode
const startApp = () => {
    return new Promise((resolve) => {
        console.log('Starting SpinShare in development mode...');

        // Start the app in a new process
        const child = exec('npm start', { detached: true }, (error) => {
            if (error) {
                console.error(`Error starting app: ${error}`);
            }
        });

        // Detach the child process
        child.unref();

        // Give the app some time to start
        setTimeout(() => {
            console.log('App should be started now.');
            resolve();
        }, 5000); // Wait 5 seconds for the app to start
    });
};

// Open the URL with the spinshare:// protocol
const openProtocolUrl = (url) => {
    console.log(`Opening URL: ${url}`);
    // Use xdg-open on Linux to open the URL
    exec(`xdg-open "${url}"`, (error) => {
        if (error) {
            console.error(`Error opening URL: ${error}`);
            return;
        }
        console.log('URL opened successfully.');
    });
};

// Main function
async function main() {
    console.log('Testing spinshare:// protocol in development mode');

    // Check if the app is already running
    const appRunning = await isAppRunning();

    if (!appRunning) {
        console.log('App is not running.');
        await startApp();
    } else {
        console.log('App is already running.');
    }

    // Open the URL with the spinshare:// protocol
    openProtocolUrl(testUrl);
}

// Run the main function
main().catch(console.error);
