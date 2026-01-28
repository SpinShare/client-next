const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: true,
        executableName: 'spinshare-client-next',
        icon: './src/renderer/assets/images/icon',
        productName: 'SpinShare',
        protocols: [
            {
                name: 'SpinShare',
                schemes: ['spinshare'],
            },
        ],
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupExe: 'SpinShare-Setup.exe',
                setupIcon: './src/renderer/assets/images/icon.ico',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['linux'],
            config: {
                executableName: 'spinshare-client-next',
                mimeType: ['x-scheme-handler/spinshare'],
            },
        },
        {
            name: '@reforged/maker-appimage',
            platforms: ['linux'],
            config: {
                options: {
                    bin: 'spinshare-client-next',
                    name: 'SpinShare',
                    productName: 'SpinShare',
                    genericName: 'SpinShare Client',
                    categories: ['Audio', 'Game'],
                    icon: './src/renderer/assets/images/icon.png',
                },
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-vite',
            config: {
                build: [
                    {
                        entry: 'src/main.js',
                        config: 'vite.main.config.mjs',
                        target: 'main',
                    },
                    {
                        entry: 'src/preload.js',
                        config: 'vite.preload.config.mjs',
                        target: 'preload',
                    },
                ],
                renderer: [
                    {
                        name: 'main_window',
                        config: 'vite.renderer.config.mjs',
                    },
                ],
            },
        },
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};