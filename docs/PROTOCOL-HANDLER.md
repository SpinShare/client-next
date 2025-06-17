# Testing the SpinShare Protocol Handler in Development Mode

This document explains how to test the `spinshare://` protocol handler functionality in development mode without needing to build and install the application.

## How the Protocol Handler Works

The SpinShare client registers a custom URL protocol handler for `spinshare://` URLs. This allows users to click on links like `spinshare://chart/154` in their browser, and the SpinShare client will open and navigate to the specified chart.

The protocol handler supports the following URL formats:
- `spinshare://chart/{id}` - Opens the chart with the specified ID
- `spinshare://user/{id}` - Opens the user profile with the specified ID
- `spinshare://playlist/{id}` - Opens the playlist with the specified ID

## Testing in Development Mode

When running the application in development mode, the protocol handler is registered differently than in production mode. The application uses `process.defaultApp` to detect if it's running in development mode and adjusts the protocol registration accordingly.

We've provided several test scripts to help you test the protocol handler functionality in development mode:

1. Platform-specific scripts that launch the app and open a URL
2. A direct test script that tests the URL handling logic without system integration

### Windows

1. Make sure you have Node.js installed
2. Open a command prompt in the project directory
3. Run the test script:
   ```
   node test-protocol-windows.js
   ```

The script will:
1. Check if the SpinShare client is already running
2. If not, start it in development mode
3. Open a test URL with the `spinshare://` protocol

You can modify the `testUrl` variable in the script to test different routes.

### Linux

1. Make sure you have Node.js installed
2. Open a terminal in the project directory
3. Run the test script:
   ```
   node test-protocol-linux.js
   ```

The script will:
1. Check if the SpinShare client is already running
2. If not, start it in development mode
3. Open a test URL with the `spinshare://` protocol

You can modify the `testUrl` variable in the script to test different routes.

### macOS

On macOS, you can test the protocol handler by running the following command in Terminal:

```
open "spinshare://chart/154"
```

If the app is already running in development mode, it should handle the URL. If not, you'll need to start the app first with `npm start`.

### Direct Testing (All Platforms)

We've also provided a direct test script that tests the URL handling logic without relying on system protocol registration. This is useful for quickly verifying that the URL parsing and routing logic works correctly.

1. Make sure you have Node.js installed
2. Open a terminal/command prompt in the project directory
3. Run the test script:
   ```
   node test-protocol-direct.js
   ```

The script will test various URL formats and report which ones were handled correctly. This is particularly useful for:
- Testing edge cases
- Verifying URL parsing logic
- Testing without system integration
- Running automated tests

## Troubleshooting

### Windows

If the protocol handler doesn't work in development mode, check the following:

1. Make sure the app is running with the correct permissions
2. Check if there are any errors in the console
3. Try running the app as administrator once to register the protocol handler

### Linux

If the protocol handler doesn't work in development mode, check the following:

1. Make sure `xdg-open` is installed on your system
2. Check if there are any errors in the console
3. Try manually registering the protocol handler:
   ```
   xdg-mime default spinshare.desktop x-scheme-handler/spinshare
   ```

### macOS

If the protocol handler doesn't work in development mode, check the following:

1. Check if there are any errors in the console
2. Try manually opening the URL with the `open` command

## How It Works Under the Hood

The protocol handler registration and handling is implemented in the following files:

- `src/main.js`: Registers the protocol handler and handles the URL
- `src/preload.js`: Exposes the navigation API to the renderer process
- `src/renderer/renderer.js`: Sets up the event listener for navigation events

When a URL with the `spinshare://` protocol is opened:

1. The operating system launches the SpinShare client (or focuses it if it's already running)
2. The URL is passed to the application as a command-line argument
3. The application extracts the URL from the command-line arguments
4. The URL is parsed to determine the route type (chart, user, playlist) and ID
5. The main process sends a message to the renderer process to navigate to the appropriate route
6. The renderer process uses Vue Router to navigate to the route

This process works the same way in both development and production modes, but the protocol registration is handled differently.