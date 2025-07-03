<template>
    <LayoutBase>
        <template v-if="!user">
            <section class="section-center">
                <Loader />
            </section>
        </template>
        <template v-else>
            <header>
                <div
                    class="avatar"
                    :style="`background-image: url('${user.avatar}')`"
                ></div>
                <div class="content">
                    <div class="meta">
                        <div class="username">
                            <span>@{{ user.username }}</span>
                        </div>
                        <div
                            class="pronouns"
                            v-if="user.pronouns"
                        >
                            {{ user.pronouns }}
                        </div>
                        <div
                            class="flags"
                            v-if="user.isPatreon || user.isVerified"
                        >
                            <div
                                class="badge-supporter"
                                v-if="user.isPatreon"
                            >
                                <Remixicon
                                    icon="heart"
                                    size="sm"
                                />
                                <span>Supporter</span>
                            </div>
                            <div
                                class="badge-verified"
                                v-if="user.isVerified"
                            >
                                <Remixicon
                                    icon="check"
                                    size="sm"
                                />
                                <span>Verified</span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button
                            class="button"
                            @click="handleOpenUrl"
                            v-interactable
                        >
                            <Remixicon
                                icon="external-link"
                                filled
                            />
                        </button>
                        <button
                            class="button"
                            @click="handleOpenReport"
                            v-interactable
                        >
                            <Remixicon
                                icon="flag-2"
                                filled
                            />
                        </button>
                    </div>
                </div>
            </header>
            <nav>
                <TabList>
                    <TabItemLink
                        :to="`/user/${userId}`"
                        label="Detail"
                    />
                    <TabItemLink
                        :to="`/user/${userId}/charts`"
                        :label="`Charts (${user.songs})`"
                    />
                    <TabItemLink
                        :to="`/user/${userId}/reviews`"
                        :label="`Reviews (${user.reviews})`"
                    />
                    <TabItemLink
                        :to="`/user/${userId}/playlists`"
                        :label="`Playlists (${user.playlists})`"
                    />
                    <TabItemLink
                        :to="`/user/${userId}/spinplays`"
                        :label="`SpinPlays (${user.spinplays})`"
                    />
                </TabList>
            </nav>
            <main>
                <router-view :key="route.fullPath" :user="user" />
            </main>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '@/layouts/LayoutBase.vue';
import { useRoute } from 'vue-router';
import {inject, onMounted, ref, watch} from 'vue';
import TabList from '@/components/Tabs/TabList.vue';
import TabItemLink from '@/components/Tabs/TabItemLink.vue';
import Remixicon from '@/components/Remixicon.vue';
import Loader from '@/components/Loader.vue';

const api = inject('api');
const externalApi = inject('externalApi');
const route = useRoute();
const userId = ref(route.params.userId);
const user = ref(null);

onMounted(async () => {
    user.value = await api.getUserDetail(userId.value);
});

function handleOpenUrl() {
    externalApi.openUrl(`https://spinsha.re/user/${user.value.id}`);
}

function handleOpenReport() {
    externalApi.openUrl(`https://spinsha.re/report/user/${user.value.id}`);
}

watch(() => [route.params.userId], async () => {
    userId.value = route.params.userId;
    user.value = await api.getUserDetail(userId.value);
});
</script>

<style scoped>
header {
    @apply p-10 py-5 grid grid-cols-[auto_1fr] gap-4 items-center;

    & .avatar {
        @apply aspect-square w-[100px] rounded-full bg-center bg-cover;
    }
    & .content {
        @apply flex flex-col gap-3;

        & .meta {
            @apply flex flex-col;

            & .username {
                @apply font-bold flex gap-1 items-center;

                & span {
                    @apply line-clamp-1;
                }
            }
            & .pronouns {
                @apply text-sm text-base-500 dark:text-base-300 mt-[-3px] line-clamp-1;
            }

            & .flags {
                @apply flex gap-1 items-center mt-2;

                & .badge-supporter {
                    @apply text-sm px-2 py-0.25 rounded-full bg-rose-800 text-rose-100 flex gap-1 items-center;
                }
                & .badge-verified {
                    @apply text-sm px-2 py-0.25 rounded-full bg-emerald-800 text-emerald-100 flex gap-1 items-center;
                }
            }
        }
        & .actions {
            @apply flex flex-wrap gap-2 mt-2;
        }
    }
}
</style>
