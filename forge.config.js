const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: true,
        executableName: 'SpinShare',
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                // Register the spinshare:// protocol during installation
                setupExe: 'SpinShare-Setup.exe',
                setupIcon: './src/assets/icons/icon.ico',
                loadingGif: './src/assets/icons/installing.gif',
                // Add protocol handler registration
                registryItems: [
                    {
                        // Register the spinshare:// protocol
                        name: 'spinshare',
                        path: [
                            'SOFTWARE',
                            'Classes',
                            'spinshare'
                        ],
                        value: 'URL:SpinShare Protocol'
                    },
                    {
                        name: 'URL Protocol',
                        path: [
                            'SOFTWARE',
                            'Classes',
                            'spinshare'
                        ],
                        value: ''
                    },
                    {
                        name: 'DefaultIcon',
                        path: [
                            'SOFTWARE',
                            'Classes',
                            'spinshare',
                            'DefaultIcon'
                        ],
                        value: '"@APPPATH@,1"'
                    },
                    {
                        name: '',
                        path: [
                            'SOFTWARE',
                            'Classes',
                            'spinshare',
                            'shell',
                            'open',
                            'command'
                        ],
                        value: '"@APPPATH@" "%1"'
                    }
                ]
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'linux'],
        },
        {
            name: '@electron-forge/maker-deb',
            platforms: ['linux'],
            config: {
                options: {
                    categories: ['Game'],
                    // Add protocol handler registration for Debian
                    mimeType: ['x-scheme-handler/spinshare'],
                    maintainer: 'SpinShare',
                    homepage: 'https://spinsha.re/',
                }
            }
        },
        // {
        //     name: '@electron-forge/maker-flatpak',
        //     platforms: ['linux'],
        //     config: {
        //         options: {
        //             categories: ['Game'],
        //             // Add protocol handler registration for Flatpak
        //             protocols: [
        //                 {
        //                     name: 'spinshare',
        //                     schemes: ['spinshare']
        //                 }
        //             ],
        //         },
        //     },
        // },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-vite',
            config: {
                // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
                // If you are familiar with Vite configuration, it will look really familiar.
                build: [
                    {
                        // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
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
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
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
