<template>
    <transition name="queue">
        <div
            class="update-banner-backdrop"
            v-if="needsUpdate"
        >
            <div class="update-banner">
                <div class="icon">
                    <span class="mdi mdi-star-four-points"></span>
                    <span class="mdi mdi-star-four-points"></span>
                </div>

                <div class="text">
                    <h1>{{ t('general.updateBanner.title') }}</h1>
                    <p>
                        {{ t('general.updateBanner.textAvailable') }}<br />{{
                            t('general.updateBanner.textPrompt')
                        }}
                    </p>
                </div>

                <div class="actions">
                    <SpinButton
                        icon="open-in-new"
                        :label="t('general.updateBanner.update')"
                        @click="openUpdate"
                        color="primary"
                    />
                    <SpinButton
                        icon="update"
                        :label="t('general.updateBanner.maybeLater')"
                        @click="closeBanner"
                    />
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const currentVersion = ref('0.0.0');
const latestRelease = ref(null);
const needsUpdate = ref(false);

onMounted(() => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'update-get-version',
            data: '',
        }),
    );
});

emitter.on('update-get-version-response', (version) => {
    currentVersion.value = version;

    window.external.sendMessage(
        JSON.stringify({
            command: 'update-get-latest',
            data: '',
        }),
    );
});

emitter.on('update-get-latest-response', (release) => {
    latestRelease.value = JSON.parse(release);

    if (latestRelease.value == null) {
        return;
    }

    needsUpdate.value = isVersionOutdated(
        currentVersion.value,
        latestRelease.value.tag_name.replace('v', '').replace('-preview', ''),
    );
});

const isVersionOutdated = (localVersion, latestVersion) => {
    let localParts = localVersion.split('.');
    let latestParts = latestVersion.split('.');

    return latestParts.every(
        (part, index) => parseInt(part) >= parseInt(localParts[index]),
    );
};

const openUpdate = () => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'open-in-browser',
            data: 'https://github.com/SpinShare/client-next/releases/latest',
        }),
    );
};

const closeBanner = () => {
    needsUpdate.value = false;
};
</script>

<style lang="scss" scoped>
.update-banner-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    z-index: 1000;

    & .update-banner {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgb(var(--colorBase));
        border-top: 1px solid rgba(var(--colorBaseText), 0.07);
        display: flex;
        gap: 20px;
        padding: 40px;
        align-items: center;

        & .icon {
            width: 64px;
            height: 64px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgb(var(--colorBase2));
            border-radius: 110px;
            overflow: hidden;

            & .mdi-star-four-points:nth-child(1) {
                font-size: 42px;
                color: rgb(var(--colorPrimary));
                transform: translate(-2px, 0) rotate(-6deg);
            }
            & .mdi-star-four-points:nth-child(2) {
                position: absolute;
                bottom: 11px;
                right: 11px;
                font-size: 16px;
                transform: rotate(6deg);
                color: rgb(var(--colorSecondary));
            }
        }

        & .text {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 5px;

            & h1 {
                font-size: 1.25rem;
            }
            & p {
                color: rgba(var(--colorBaseText), 0.6);
                line-height: 1.5rem;
            }
        }

        & .actions {
            display: flex;
            gap: 10px;
        }
    }
}
</style>
