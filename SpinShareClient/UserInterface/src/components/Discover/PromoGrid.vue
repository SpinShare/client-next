<template>
    <div
        class="promo-grid"
        v-if="promos"
    >
        <div
            class="item"
            v-for="(promo, i) in promos"
            :key="i"
            @click="
                window.spinshare.settings.IsConsole
                    ? handlePromoClick(promo.button)
                    : null
            "
            :tabindex="window.spinshare.settings.IsConsole ? 0 : -1"
        >
            <div
                class="cover"
                :style="`background-image: url(${promo.image_path})`"
            ></div>
            <div class="meta">
                <div class="type">{{ promo.type }}</div>
                <div class="title">
                    {{ promo.title.replace(/<[^>]*>?/gm, '') }}
                </div>
            </div>
            <SpinButton
                v-if="!window.spinshare.settings.IsConsole"
                :icon="getButtonIcon(promo.button)"
                :label="t('general.open')"
                @click="handlePromoClick(promo.button)"
            />
        </div>
    </div>
    <SpinLoader v-if="!promos" />
</template>

<script setup>
import router from '@/router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const BUTTON_TYPE_CHART = 0;
const BUTTON_TYPE_PLAYLIST = 1;
const BUTTON_TYPE_SEARCHQUERY = 2;
const BUTTON_TYPE_EXTERNALURL = 3;

defineProps({
    promos: {
        type: Array,
        default: () => [],
    },
});

const getButtonIcon = (buttonData) => {
    // Edge Case: Old Promos with Playlists are setup as an external URL
    if (
        buttonData.type === BUTTON_TYPE_EXTERNALURL &&
        buttonData.data.includes('playlist')
    ) {
        return 'playlist-music';
    }

    switch (buttonData.type) {
        case BUTTON_TYPE_CHART:
            return 'album';
        case BUTTON_TYPE_PLAYLIST:
            return 'playlist-music';
        case BUTTON_TYPE_SEARCHQUERY:
            return 'magnify';
        default:
        case BUTTON_TYPE_EXTERNALURL:
            return 'open-in-new';
    }
};

const handlePromoClick = (buttonData) => {
    // Edge Case: Old Promos with Playlists are setup as an external URL
    if (
        buttonData.type === BUTTON_TYPE_EXTERNALURL &&
        buttonData.data.includes('playlist')
    ) {
        router.push({
            path: '/playlist/' + buttonData.data.split('/').at(-1),
        });
        return;
    }

    switch (buttonData.type) {
        case BUTTON_TYPE_CHART:
            router.push({
                path: '/chart/' + buttonData.data,
            });
            break;
        case BUTTON_TYPE_PLAYLIST:
            router.push({
                path: '/playlist/' + buttonData.data,
            });
            break;
        case BUTTON_TYPE_SEARCHQUERY:
            router.push({
                path: '/search',
                query: {
                    type: 'charts',
                    query: buttonData.data,
                },
            });
            break;
        default:
        case BUTTON_TYPE_EXTERNALURL:
            window.external.sendMessage(
                JSON.stringify({
                    command: 'open-in-browser',
                    data: buttonData.data,
                }),
            );
            break;
    }
};
</script>

<style lang="scss" scoped>
.promo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    & .item {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;

        & .cover {
            grid-column: 1 / span 2;
            background-color: rgba(var(--colorBaseText), 0.07);
            background-position: center;
            background-size: cover;
            height: 200px;
            border-radius: 6px;
        }
        & .meta {
            display: grid;
            gap: 5px;

            & .type {
                color: rgba(var(--colorBaseText), 0.4);
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 0.1rem;
            }
        }
    }
}

@media screen and (max-width: 1000px) {
    .promo-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<style lang="scss" scoped v-if="window.spinshare.settings.IsConsole">
.promo-grid {
    & .item {
        display: grid;
        grid-template-columns: 1fr auto;
        background: rgba(var(--colorBaseText), 0.07);
        border-radius: 5px;
        overflow: hidden;
        gap: 0;

        & .cover {
            border-radius: 0;
        }
        & .meta {
            display: grid;
            gap: 8px;
            padding: 20px;

            & .type {
                letter-spacing: 0.1rem;
            }
        }

        &:focus {
            outline: 3px solid silver;
        }
    }
}
</style>
