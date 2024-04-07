<template>
    <transition name="queue">
        <div
            class="console-navigation"
            v-if="isOpen"
            @click.self="toggleVisibility"
            role="dialog"
            aria-modal="true"
        >
            <aside>
                <div class="brand">
                    <img src="../../assets/logo.svg" />
                </div>
                <nav>
                    <router-link
                        to="/"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-view-dashboard-outline"></span>
                        <span>{{ t('general.sidebar.frontpage') }}</span>
                    </router-link>
                    <router-link
                        to="/search"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-magnify"></span>
                        <span>{{ t('general.sidebar.search') }}</span>
                    </router-link>
                    <router-link
                        to="/discover/new/0"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-new-box"></span>
                        <span>{{ t('general.sidebar.new') }}</span>
                    </router-link>
                    <router-link
                        to="/discover/updated/0"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-update"></span>
                        <span>{{ t('general.sidebar.updated') }}</span>
                    </router-link>
                    <router-link
                        to="/discover/hotThisWeek/0"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-fire"></span>
                        <span>{{ t('general.sidebar.trending') }}</span>
                    </router-link>
                </nav>

                <nav>
                    <router-link
                        to="/library"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-archive-music-outline"></span>
                        <span>{{ t('general.sidebar.library') }}</span>
                    </router-link>
                    <div
                        class="item"
                        :class="{ active: downloadQueueActive }"
                        @click="toggleDownloadQueue"
                        tabindex="0"
                    >
                        <span class="mdi mdi-download-box-outline"></span>
                        <span>{{ t('general.sidebar.downloads') }}</span>
                        <div
                            class="badge"
                            v-if="downloadQueueCount !== 0"
                        >
                            {{ downloadQueueCount }}
                        </div>
                    </div>
                    <router-link
                        to="/settings"
                        class="item"
                        @click.self="emitter.emit('console-navigation-toggle')"
                    >
                        <span class="mdi mdi-cog-outline"></span>
                        <span>{{ t('general.sidebar.settings') }}</span>
                    </router-link>
                </nav>
            </aside>

            <DownloadQueue
                @change-active="
                    (state) => {
                        downloadQueueActive = state;
                    }
                "
            />
        </div>
    </transition>
</template>

<script setup>
import useGamepad, { Buttons, focusableElements } from '@/modules/useGamepad';
import { ref, inject, onMounted, onUnmounted, nextTick } from 'vue';
import DownloadQueue from '@/components/DownloadQueue.vue';
const emitter = inject('emitter');

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const isOpen = ref(false);

const downloadQueueCount = ref(0);
const downloadQueueActive = ref(false);

const toggleDownloadQueue = () => {
    emitter.emit('download-queue-toggle');
};

const gamepad = useGamepad();
gamepad.on('buttonReleased', async (buttonIndex) => {
    switch (buttonIndex) {
        case Buttons.MENU:
            toggleVisibility();
            break;
    }
});

const toggleVisibility = async () => {
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
        document.body.querySelector('.layout-app').style.pointerEvents = 'none';

        // Select active Element in navigation, fallback to first element
        await nextTick();
        let element;
        element = document.body.querySelector(
            '.console-navigation .router-link-exact-active, .console-navigation .active',
        );

        if (!element) {
            element = document.body
                .querySelector('.console-navigation')
                .querySelector(focusableElements);
        }

        if (element) {
            element.focus();
        }
    } else {
        document.body.querySelector('.layout-app').style.pointerEvents = '';

        // Select first Element in page
        await nextTick();
        const firstFocusableElement = document.body
            .querySelector('.layout-app > main')
            .querySelector(focusableElements);

        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }
};

onMounted(() => {
    window.external.sendMessage(
        JSON.stringify({
            command: 'queue-get-count',
            data: '',
        }),
    );

    emitter.on('console-navigation-toggle', () => {
        toggleVisibility();
    });

    emitter.on('queue-get-count-response', (data) => {
        downloadQueueCount.value = data;
    });
});
onUnmounted(() => {
    emitter.off('console-navigation-toggle');
    emitter.off('queue-get-count-response');
});
</script>

<style lang="scss" scoped>
.console-navigation {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    z-index: 100;

    & aside {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 60px;
        width: 400px;
        background: rgb(var(--colorBase));
        border-right: 1px solid rgb(var(--colorBase2));
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;

        & .brand {
            height: 45px;
            display: flex;
            justify-content: center;
            align-items: center;

            & img {
                height: 45px;
            }
        }

        & nav {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: stretch;

            &:nth-child(2) {
                flex-grow: 1;
            }

            & .item {
                height: 50px;
                display: flex;
                border-radius: 100px;
                gap: 10px;
                align-items: center;
                transition: 0.15s ease-in-out all;
                position: relative;
                text-decoration: none;
                padding: 0 20px;

                & > span.mdi {
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

                &.router-link-exact-active,
                &.active {
                    background: rgba(var(--colorPrimary), 15%);
                    color: rgba(var(--colorPrimary), 100%);
                }

                &:not(.router-link-exact-active):not(.active):hover {
                    background: rgba(var(--colorBaseText), 0.07);
                    cursor: pointer;
                }

                &:focus {
                    outline: 3px solid silver;
                }
            }
        }
    }
}
</style>
