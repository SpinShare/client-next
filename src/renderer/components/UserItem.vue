<template>
    <RouterLink
        :to="`/user/${id}`"
        :class="`user-item ${mini ? 'mini' : ''}`"
        v-interactable
    >
        <div
            class="avatar"
            :style="`background-image: url('${avatar}')`"
        ></div>
        <div class="content">
            <div class="username">
                <span>@{{ username }}</span>
            </div>
            <div
                class="pronouns"
                v-if="pronouns"
            >
                {{ pronouns }}
            </div>
        </div>
        <div class="flags">
            <div
                class="badge-supporter"
                v-if="isPatreon"
            >
                <Remixicon
                    icon="heart"
                    size="sm"
                />
            </div>
            <div
                class="badge-verified"
                v-if="isVerified"
            >
                <Remixicon
                    icon="check"
                    size="sm"
                />
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    mini: {
        type: Boolean,
        default: false,
    },
    username: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isPatreon: {
        type: Boolean,
        default: false,
    },
    pronouns: {
        type: [String, Boolean],
        default: false,
    },
    avatar: {
        type: [String, Boolean],
        default: false,
    },
});
</script>

<style scoped>
.user-item {
    @apply bg-base-900 relative rounded-md overflow-hidden transition-all cursor-pointer p-2 grid grid-cols-[48px_1fr_auto] gap-4 items-center;

    & .avatar {
        @apply w-[48px] h-[48px] bg-cover bg-center bg-base-700 rounded-full;
    }

    & .content {
        @apply flex flex-col;

        & .username {
            @apply font-bold flex gap-1 items-center;

            & span {
                @apply line-clamp-1;
            }
        }
        & .pronouns {
            @apply text-sm text-base-300 mt-[-3px] line-clamp-1;
        }
    }

    & .flags {
        @apply flex gap-1 items-center mr-2;

        & .badge-supporter {
            @apply text-sm px-2 py-0.25 rounded-full bg-rose-800 text-rose-100 flex gap-1 items-center;
        }
        & .badge-verified {
            @apply text-sm px-2 py-0.25 rounded-full bg-emerald-800 text-emerald-100 flex gap-1 items-center;
        }
    }

    &:hover {
        @apply bg-base-800;
    }

    &.mini {
        @apply gap-2 grid-cols-[32px_1fr_auto] p-2 py-1;

        & .avatar {
            @apply w-[32px] h-[32px];
        }
    }
}
</style>
