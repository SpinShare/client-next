<template>
    <div
        class="user-item"
        @click.left="handleClick"
    >
        <img :src="avatar" alt="User Avatar" />
        <div class="meta">
            <div class="username">{{ username }}</div>
            <div class="pronouns" v-if="pronouns">{{ pronouns }}</div>
            <div class="tags" v-if="isPatreon || isVerified">
                <span class="tag tag-verified" v-if="isVerified">
                    <span class="mdi mdi-check"></span>
                    <span>Verified</span>
                </span>
                <span class="tag tag-supporter" v-if="isPatreon">
                    <span class="mdi mdi-heart"></span>
                    <span>Supporter</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import router from "@/router";

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
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
});

const handleClick = () => {
    router.push({
        path: '/user/' + props.id,
    });
};
</script>

<style lang="scss" scoped>
.user-item {
    background: rgba(var(--colorBaseText),0.07);
    border-radius: 6px;
    padding: 10px;
    display: grid;
    transition: 0.15s ease-in-out all;
    grid-template-columns: auto 1fr;
    gap: 15px;
    align-items: center;

    & img {
        width: 48px;
        height: 48px;
        border-radius: 150px;
    }
    & .meta {
        display: flex;
        flex-direction: column;
        gap: 3px;

        & .username {
            align-items: center;
            display: flex;
            gap: 10px;
        }
        & .pronouns {
            font-size: 0.75rem;
            color: rgba(var(--colorBaseText),0.4);
        }
        & .tags {
            margin-top: 2px;
            align-items: center;
            display: flex;
            gap: 5px;

            & .tag {
                background: rgba(var(--colorBaseText), 0.07);
                display: flex;
                gap: 5px;
                padding: 3px 10px 3px 7px;
                border-radius: 100px;
                align-items: center;

                & > span:nth-child(2) {
                    font-size: 0.75rem;
                    line-height: 0.75rem;
                }

                &.tag-verified {
                    background: rgba(var(--colorSuccess), 0.2);
                    color: rgba(var(--colorSuccess));
                }
                &.tag-supporter {
                    background: rgba(var(--colorPrimary), 0.2);
                    color: rgba(var(--colorPrimary));
                }
            }
        }
    }

    &:hover {
        background: rgba(var(--colorBaseText),0.14);
        cursor: pointer;
    }
}
</style>