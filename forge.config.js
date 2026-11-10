const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('node:fs/promises');
const path = require('node:path');

const LINUX_EXECUTABLE = 'spinshare-client-next';

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
        {
            name: '@electron-forge/maker-flatpak',
            platforms: ['linux'],
            config: {
                options: {
                    id: 're.spinsha.client',
                    bin: `${LINUX_EXECUTABLE}.bin`,
                    productName: 'SpinShare',
                    genericName: 'SpinShare Client',
                    categories: ['Audio', 'Game'],
                    mimeType: ['x-scheme-handler/spinshare'],
                    icon: './src/renderer/assets/images/icon.png',
                    runtime: 'org.freedesktop.Platform',
                    runtimeVersion: '26.08',
                    sdk: 'org.freedesktop.Sdk',
                    base: 'org.electronjs.Electron2.BaseApp',
                    baseVersion: '26.08',
                    modules: [],
                },
            },
        },
    ],
    hooks: {
        // On Linux, put a launcher script in front of the Electron binary that removes the Steam overlay from LD_PRELOAD before Electron starts
        postPackage: async (forgeConfig, { platform, outputPaths }) => {
            if (platform !== 'linux') return;

            const launcher = (await fs.readFile(path.resolve(__dirname, 'build/linux-launcher.sh'), 'utf8')).replaceAll('\r\n', '\n');

            for (const outputPath of outputPaths) {
                const executable = path.join(outputPath, LINUX_EXECUTABLE);
                await fs.rename(executable, `${executable}.bin`);
                await fs.chmod(`${executable}.bin`, 0o755);
                await fs.writeFile(executable, launcher, { mode: 0o755 });
                await fs.chmod(executable, 0o755);
            }
        },
    },
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
