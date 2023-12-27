<template>
    <aside>
        <div class="brand">
            <img src="../../assets/icon.svg" />
        </div>
        
        <nav>
            <router-link to="/" class="item" v-tooltip.right="t('general.sidebar.frontpage')">
                <span class="mdi mdi-view-dashboard-outline"></span>
            </router-link>
            <router-link to="/search" class="item" v-tooltip.right="t('general.sidebar.search')">
                <span class="mdi mdi-magnify"></span>
            </router-link>
            <router-link to="/discover/new/0" class="item" v-tooltip.right="t('general.sidebar.new')">
                <span class="mdi mdi-new-box"></span>
            </router-link>
            <router-link to="/discover/updated/0" class="item" v-tooltip.right="t('general.sidebar.updated')">
                <span class="mdi mdi-update"></span>
            </router-link>
            <router-link to="/discover/hotThisWeek/0" class="item" v-tooltip.right="t('general.sidebar.trending')">
                <span class="mdi mdi-fire"></span>
            </router-link>
        </nav>
        
        <nav>
            <router-link to="/library" class="item" v-tooltip.right="t('general.sidebar.library')">
                <span class="mdi mdi-archive-music-outline"></span>
            </router-link>
            <div
                class="item"
                :class="{'active': downloadQueueActive}"
                v-tooltip.right="t('general.sidebar.downloads')"
                @click="toggleDownloadQueue"
            >
                <span class="mdi mdi-download-box-outline"></span>
                <div class="badge" v-if="downloadQueueCount !== 0">{{ downloadQueueCount }}</div>
            </div>
            <router-link to="/settings" class="item" v-tooltip.right="t('general.sidebar.settings')">
                <span class="mdi mdi-cog-outline"></span>
            </router-link>
        </nav>
        
        <DownloadQueue @change-active="(state) => { downloadQueueActive = state }" />
    </aside>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import DownloadQueue from "@/layout_desktop/components/DownloadQueue.vue";
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const downloadQueueCount = ref(0);
const downloadQueueActive = ref(false);

emitter.on('queue-get-count-response', (data) => {
    downloadQueueCount.value = data;
});

onMounted(() => {
    window.external.sendMessage(JSON.stringify({
        command: "queue-get-count",
        data: "",
    }));
});

const toggleDownloadQueue = () => {
    emitter.emit('download-queue-toggle');
};
</script>

<style lang="scss" scoped>
aside {
    border-right: 1px solid rgba(var(--colorBaseText),0.07);
    background: var(--colorBase);
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-gap: 15px;
	justify-content: center;
    align-items: center;
    padding: 25px 0;
    
    & .brand {
        width: 42px;
        display: flex;
        justify-content: center;
        align-items: center;
        
        & img {
            width: 24px;
            height: 24px;
        }
    }
    
    & nav {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        
        & .item {
            width: 42px;
            height: 42px;
            display: flex;
            border-radius: 100px;
            justify-content: center;
            align-items: center;
            transition: 0.15s ease-in-out all;
            position: relative;
            
            & > span {
                font-size: 22px;
            }
            
            & .badge {
                background: rgb(var(--colorPrimary));
                color: rgb(var(--colorBaseText));
                font-size: 0.75rem;
                font-weight: bold;
                padding: 3px 5px;
                border-radius: 50px;
                position: absolute;
                bottom: 0;
                right: 0;
            }

            &.router-link-exact-active, &.active {
                background: rgba(var(--colorPrimary), 15%);
                color: rgba(var(--colorPrimary), 100%);
            }
            
            &:not(.router-link-exact-active):not(.active):hover {
                background: rgba(var(--colorBaseText), 0.07);
                cursor: pointer;
            }
        }
    }
}
</style>