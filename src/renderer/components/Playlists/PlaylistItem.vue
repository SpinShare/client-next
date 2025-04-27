<template>
    <RouterLink
        :to="`/playlist/${id}`"
        :class="`playlist-item`"
    >
        <div
            class="cover"
            :style="`background-image: url('${cover}')`"
        ></div>
        <div class="meta">
            <h1>
                <span>{{ title }}</span>
                <div
                    class="badge-official"
                    v-if="isOfficial"
                >
                    <Remixicon
                        icon="check"
                        filled
                        size="sm"
                    />
                    <span>Official</span>
                </div>
            </h1>
            <div class="additionals">
                <div class="badge-charts">
                    <Remixicon
                        icon="music-2"
                        filled
                    />
                    <span>{{ songs }} charts</span>
                </div>
                <UserTooltip
                    :label="`@${user.username}`"
                    :user-id="user.id"
                />
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import UserTooltip from '@/components/UserTooltip.vue';

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
    songs: {
        type: Number,
        required: true,
    },
    isOfficial: {
        type: Boolean,
        default: false,
    },
    cover: {
        type: String,
        required: true,
    },
});
</script>

<style scoped>
.playlist-item {
    @apply bg-base-900 relative rounded-md overflow-hidden transition-all cursor-pointer flex flex-col;

    & .cover {
        @apply h-[150px] bg-cover bg-center;
    }

    & .meta {
        @apply p-4 flex flex-col;

        & h1 {
            @apply flex gap-2 items-center;

            & > span {
                @apply font-bold line-clamp-1;
            }
            & .badge-official {
                @apply text-sm px-2 py-0.25 rounded-full bg-emerald-700 text-emerald-50 self-start flex gap-1 items-center;
            }
        }
        & .additionals {
            @apply flex gap-2 items-center;

            & .badge-charts {
                @apply flex gap-1 items-center text-base-400;
            }
        }
    }

    &:hover {
        @apply bg-base-800;
    }
}
</style>
