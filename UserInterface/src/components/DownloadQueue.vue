<template>
    <transition name="queue">
        <section class="download-queue-shade" v-if="isActive" @click.self="changeState(false)">
            <section class="download-queue">
                <div
                    class="item"
                    v-for="item in queue"
                    :class="'state-' + item.State"
                >
                    <div class="cover" :style="`background-image: url(${ item.Cover })`"></div>
                    <div class="meta">
                        <div class="title">{{ item.Title }}</div>
                        <div class="artist">{{ item.Artist }} &bull; {{ item.Charter }}</div>
                    </div>
                    <div class="actions">
                        <SpinButton
                            v-if="item.State === STATE_QUEUED"
                            icon="trash-can-outline"
                            color="danger"
                        />
                        <div class="loading" v-if="[STATE_DOWNLOADING, STATE_EXTRACTING, STATE_COPYING, STATE_CACHING].includes(item.State)">
                            <span class="mdi mdi-loading"></span>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    </transition>
</template>

<script setup>
import { ref, inject } from 'vue';
const emitter = inject('emitter');
const emit = defineEmits(['change-active']);

const isActive = ref(false);
const queue = ref([]);

const STATE_QUEUED = 0;
const STATE_DOWNLOADING = 1;
const STATE_EXTRACTING = 2;
const STATE_COPYING = 3;
const STATE_CACHING = 4;
const STATE_DONE = 5;

emitter.on('download-queue-toggle', () => {
    changeState(!isActive.value);
});
emitter.on('download-queue-open', () => {
    changeState(true);
});
emitter.on('download-queue-close', () => {
    changeState(false);
});
emitter.on('queue-item-update-response', (downloadItem) => {
    let existingItemIndex = queue.value.findIndex(x => x.ID === downloadItem.ID);
    
    if(existingItemIndex !== -1) {
        queue.value[existingItemIndex] = downloadItem;
    } else {
        queue.value.push(downloadItem);
    }
});

const changeState = (newState) => {
    isActive.value = newState;
    emit('change-active', isActive.value);
}

const getCurrentState = (stateId) => {
    switch(stateId) {
        case STATE_QUEUED:
            return 'queued';
        case STATE_DOWNLOADING:
            return 'downloading';
        case STATE_EXTRACTING:
            return 'extracting';
        case STATE_COPYING:
            return 'copying';
        case STATE_CACHING:
            return 'caching';
        case STATE_DONE:
            return 'done';
    }
};
</script>

<style lang="scss">
.download-queue-shade {
    position: absolute;
    left: 60px;
    bottom: 0;
    top: 0;
    right: 0;
    background: rgba(0,0,0,0.2);
    z-index: 10;
    cursor: pointer;
    
    & .download-queue {
        cursor: default;
        width: 400px;
        height: 100%;
        overflow-y: scroll;
        background: rgb(var(--colorBase));
        border-right: 1px solid rgba(var(--colorBaseText),0.07);
        display: flex;
        flex-direction: column;
        
        & .item {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border-bottom: 1px solid rgba(var(--colorBaseText),0.07);

            & .cover {
                aspect-ratio: 1 / 1;
                height: 60px;
                border-radius: 4px;
                background-position: center;
                background-size: cover;
            }
            & .meta {
                display: grid;
                gap: 3px;

                & .artist {
                    color: rgba(var(--colorBaseText),0.4);
                    font-size: 0.9em;
                }
            }
            & .actions {
                & .loading {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    animation: loadingLoop 0.4s linear infinite;
                }
            }
            
            &.state-0 {
                opacity: 0.3;
            }
            &.state-5 {
                background: rgba(var(--colorSuccess), 0.14);
            }
        }
    }
}
</style>