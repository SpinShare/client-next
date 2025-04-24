<template>
    <Tooltip>
        <template #default>
            <RouterLink
                :to="`/user/${userId}`"
                class="user-tooltip-link"
                @mouseover="tryGetUserInfo"
            >
                {{ label }}
            </RouterLink>
        </template>
        <template #content>
            <div
                class="section-center py-2.5"
                v-if="!userInfo"
            >
                <Loader
                    :size="32"
                    :border-width="4"
                />
            </div>
            <template v-else>
                <div class="user-info">
                    <div
                        class="avatar"
                        :style="`background-image: url(${userInfo.avatar})`"
                    ></div>
                    <div class="meta">
                        <div class="username">{{ userInfo.username }}</div>
                        <div
                            class="pronouns"
                            v-if="userInfo.pronouns"
                        >
                            {{ userInfo.pronouns }}
                        </div>
                        <div class="statistics">
                            <div>
                                <Remixicon
                                    icon="music-2"
                                    filled
                                />
                                <span>{{ userInfo.songs }}</span>
                            </div>
                            <div>
                                <Remixicon
                                    icon="album"
                                    size="sm"
                                    filled
                                />
                                <span>{{ userInfo.playlists }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </template>
    </Tooltip>
</template>

<script setup>
import Tooltip from '@/components/Tooltip.vue';
import { ref, inject } from 'vue';
import Loader from '@/components/Loader.vue';
import Remixicon from '@/components/Remixicon.vue';

const props = defineProps({
    userId: {
        type: Number,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
});

const api = inject('api');
const userInfo = ref(null);

async function tryGetUserInfo() {
    if (userInfo.value !== null) return;
    userInfo.value = await api.getUser(props.userId);
}
</script>

<style scoped>
a {
    @apply font-bold;
}
.user-info {
    @apply grid grid-cols-[64px_1fr] gap-2 items-center;

    & .avatar {
        @apply w-[64px] h-[64px] rounded-full bg-center bg-cover;
    }
    & .meta {
        @apply flex flex-col;

        & .username {
            @apply font-bold line-clamp-1;
        }
        & .pronouns {
            @apply text-sm text-base-400 mt-[-5px] line-clamp-1;
        }
        & .statistics {
            @apply flex gap-2 items-center;

            & > div {
                @apply flex gap-1 items-center text-xs;
            }
        }
    }
}
</style>
