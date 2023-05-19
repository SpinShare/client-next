<template>
    <div class="promo-grid" v-if="promos">
        <div class="item" v-for="promo in promos">
            <div class="cover" :style="`background-image: url(${ promo.image_path })`"></div>
            <div class="meta">
                <div class="type">{{ promo.type }}</div>
                <div class="title">{{ promo.title.replace(/<[^>]*>?/gm, '') }}</div>
            </div>
            <SpinButton
                :icon="getButtonIcon(promo.button.type)"
                label="Open"
                @click="handlePromoClick(promo.button)"
            />
        </div>
    </div>
    <SpinLoader
        v-if="!promos"
    />
</template>

<script setup>
const BUTTON_TYPE_CHART = 0;
const BUTTON_TYPE_PLAYLIST = 1;
const BUTTON_TYPE_SEARCHQUERY = 2;
const BUTTON_TYPE_EXTERNALURL = 3;

defineProps({
    promos: {
        type: Array,
        default: () => [],
    }
});

const getButtonIcon = (type) => {
    switch(type) {
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
    switch(buttonData.type) {
        case BUTTON_TYPE_CHART:
            // TODO
            break;
        case BUTTON_TYPE_PLAYLIST:
            // TODO
            break;
        case BUTTON_TYPE_SEARCHQUERY:
            // TODO
            break;
        default:
        case BUTTON_TYPE_EXTERNALURL:
            // Sending Message to C#
            window.external.sendMessage(JSON.stringify({
                command: "open-in-browser",
                data: buttonData.data,
            }));
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
            background-color: rgba(255,255,255,0.07);
            background-position: center;
            background-size: cover;
            height: 200px;
            border-radius: 6px;
        }
        & .meta {
            display: grid;
            gap: 5px;
            
            & .type {
                color: rgba(255,255,255,0.4);
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
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