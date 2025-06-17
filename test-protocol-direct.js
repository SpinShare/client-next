// Direct test script for spinshare:// protocol handling
// This script directly tests the URL handling logic without relying on system protocol registration

const { URL } = require('url');

// Test URLs
const testUrls = [
    'spinshare://chart/154',
    'spinshare://user/123',
    'spinshare://playlist/456',
    'spinshare://invalid/789', // Should log "Unknown deep link type"
    'spinshare://chart/with/extra/segments', // Should still work, using first two segments
    'spinshare://chart', // Should not navigate (not enough segments)
    'http://example.com' // Should not be handled
];

// Mock the mainWindow.webContents.send function
const mockSend = (channel, route) => {
    console.log(`[MOCK] Sending to channel '${channel}': ${route}`);
    return true;
};

// Function to handle deep link navigation (copied from main.js)
function handleDeepLink(url) {
    console.log(`\nTesting URL: ${url}`);
    
    try {
        const parsedUrl = new URL(url);
        
        // Only handle spinshare:// URLs
        if (parsedUrl.protocol !== 'spinshare:') {
            console.log(`Not a spinshare:// URL: ${url}`);
            return false;
        }
        
        const pathname = parsedUrl.pathname.substring(1); // Remove leading slash
        const segments = pathname.split('/');
        
        if (segments.length >= 2) {
            const type = segments[0];
            const id = segments[1];
            
            console.log(`Type: ${type}, ID: ${id}`);
            
            // Navigate to the appropriate route based on the URL
            switch (type) {
                case 'chart':
                    return mockSend('navigate-to', `/chart/${id}`);
                case 'user':
                    return mockSend('navigate-to', `/user/${id}`);
                case 'playlist':
                    return mockSend('navigate-to', `/playlist/${id}`);
                default:
                    console.log(`Unknown deep link type: ${type}`);
                    return false;
            }
        } else {
            console.log(`Not enough segments in URL: ${url}`);
            return false;
        }
    } catch (error) {
        console.error(`Error handling deep link: ${error.message}`);
        return false;
    }
}

// Test all URLs
console.log('=== Testing spinshare:// protocol handling ===');
let passCount = 0;
let failCount = 0;

testUrls.forEach(url => {
    const result = handleDeepLink(url);
    if (result) {
        console.log('✅ PASS');
        passCount++;
    } else {
        console.log('❌ FAIL');
        failCount++;
    }
});

console.log('\n=== Test Results ===');
console.log(`Total tests: ${testUrls.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);