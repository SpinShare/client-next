# SpinShare Protocol Handler Testing

This directory contains scripts and documentation for testing the SpinShare protocol handler functionality in development mode.

## Available Testing Scripts

### Platform-Specific Scripts

- `test-protocol-windows.js` - Tests the protocol handler on Windows
- `test-protocol-linux.js` - Tests the protocol handler on Linux

These scripts will:
1. Check if the SpinShare client is already running
2. If not, start it in development mode
3. Open a test URL with the `spinshare://` protocol

### Direct Testing Script

- `test-protocol-direct.js` - Tests the URL handling logic directly without system integration

This script tests various URL formats and reports which ones were handled correctly. It's useful for quickly verifying that the URL parsing and routing logic works correctly without relying on system protocol registration.

## Documentation

For detailed information about how the protocol handler works and how to test it, see:

- [PROTOCOL-HANDLER.md](./PROTOCOL-HANDLER.md) - Comprehensive documentation on testing the protocol handler

## Quick Start

### Windows

```
node test-protocol-windows.js
```

### Linux

```
node test-protocol-linux.js
```

### Direct Testing (All Platforms)

```
node test-protocol-direct.js
```

## Modifying Test URLs

You can modify the `testUrl` variable in the platform-specific scripts to test different routes:

```javascript
// URL to test - change this to test different routes
const testUrl = 'spinshare://chart/154';
```

For the direct testing script, you can modify the `testUrls` array to add or remove test cases:

```javascript
// Test URLs
const testUrls = [
    'spinshare://chart/154',
    'spinshare://user/123',
    // Add more test URLs here
];
```

## Troubleshooting

If you encounter issues with the protocol handler, refer to the troubleshooting section in [PROTOCOL-HANDLER.md](./PROTOCOL-HANDLER.md).