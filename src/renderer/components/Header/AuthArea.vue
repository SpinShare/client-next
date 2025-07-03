<template>
    <div class="auth-area">
        <RouterLink
            to="/connect/login"
            class="button ghost"
            v-if="!isLoggedIn"
            v-interactable
        >
            <Remixicon icon="key" />
            <span>Login</span>
        </RouterLink>

        <template v-else>
            <template v-if="!profile">
                <Loader
                    :size="24"
                    :border-width="4"
                />
            </template>
            <template v-else>
                <button
                    class="button brand"
                    v-interactable
                    @click="handleUpload"
                >
                    <Remixicon icon="upload" />
                    <span>Upload</span>
                </button>

                <button
                    class="button profile-button"
                    :style="`background-image: url('${profile.avatar}')`"
                    @click="connectPopupOpen = !connectPopupOpen"
                    v-interactable
                ></button>
                <transition name="popup">
                    <div
                        v-if="connectPopupOpen"
                        :class="`connect-popup`"
                    >
                        <header>
                            <div class="content">
                                <div class="username">
                                    <span>@{{ profile.username }}</span>
                                </div>
                                <div
                                    class="pronouns"
                                    v-if="profile.pronouns"
                                >
                                    {{ profile.pronouns }}
                                </div>
                            </div>
                            <div class="flags">
                                <div
                                    class="badge-supporter"
                                    v-if="profile.isPatreon"
                                >
                                    <Remixicon
                                        icon="heart"
                                        size="sm"
                                    />
                                </div>
                                <div
                                    class="badge-verified"
                                    v-if="profile.isVerified"
                                >
                                    <Remixicon
                                        icon="check"
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </header>
                        <nav>
                            <RouterLink
                                :to="`/user/${profile.id}`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="user"
                                    size="xl"
                                />
                                <span>Profile</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/charts`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="music-2"
                                    size="xl"
                                />
                                <span>Charts</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/reviews`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="award"
                                    size="xl"
                                />
                                <span>Reviews</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/playlists`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="album"
                                    size="xl"
                                />
                                <span>Playlists</span>
                            </RouterLink>
                            <RouterLink
                                :to="`/user/${profile.id}/spinplays`"
                                class="item"
                                v-interactable
                            >
                                <Remixicon
                                    icon="youtube"
                                    size="xl"
                                />
                                <span>SpinPlays</span>
                            </RouterLink>
                        </nav>
                        <nav>
                            <button
                                class="item"
                                @click="handleLogout"
                                v-interactable
                            >
                                <Remixicon
                                    icon="door-open"
                                    size="xl"
                                />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </transition>
            </template>
        </template>
    </div>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import Loader from '@/components/Loader.vue';

const mitt = inject('mitt');
const connect = inject('connect');
const externalApi = inject('externalApi');
const isLoggedIn = ref(false);
const profile = ref(null);
const connectPopupOpen = ref(false);

onMounted(async () => {
    mitt.on('auth-updated', onAuthUpdated);
    await onAuthUpdated();
});

onUnmounted(() => {
    mitt.off('auth-updated');
});

async function onAuthUpdated() {
    isLoggedIn.value = await connect.isLoggedIn();

    if (isLoggedIn.value) {
        profile.value = await connect.getProfile();
    } else {
        profile.value = null;
    }
}

function handleUpload() {
    externalApi.openUrl("https://spinsha.re/upload");
}

function handleLogout() {
    connect.logout();
    mitt.emit('auth-updated');
}
</script>

<style scoped>
.auth-area {
    @apply relative flex gap-4 items-center;

    & .profile-button {
        @apply w-8 h-8 rounded-full bg-cover bg-center transition-all cursor-pointer;

        &:hover {
            @apply opacity-60;
        }
    }
    & .connect-popup {
        @apply absolute top-10 right-0 z-10 w-[300px] bg-base-200 dark:bg-base-900 rounded-md shadow-2xl block overflow-hidden;

        & header {
            @apply flex items-center px-4 py-2;

            & .content {
                @apply flex grow flex-col;

                & .username {
                    @apply font-bold flex gap-1 items-center;

                    & span {
                        @apply line-clamp-1;
                    }
                }
                & .pronouns {
                    @apply text-sm text-base-600 dark:text-base-300 mt-[-3px] line-clamp-1;
                }
            }

            & .flags {
                @apply flex gap-1 items-center;

                & .badge-supporter {
                    @apply text-sm px-2 py-0.25 rounded-full bg-rose-800 text-rose-100 flex gap-1 items-center;
                }
                & .badge-verified {
                    @apply text-sm px-2 py-0.25 rounded-full bg-emerald-800 text-emerald-100 flex gap-1 items-center;
                }
            }
        }

        & nav {
            @apply border-t border-base-300 dark:border-base-800 flex flex-col;

            & .item {
                @apply h-[45px] transition-all flex items-center gap-2 px-4;

                &:hover {
                    @apply bg-base-300 dark:bg-base-800 cursor-pointer;
                }
            }
        }
    }
}
</style>
