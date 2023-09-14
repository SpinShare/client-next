<template>
    <div
        class="spinplay-item"
        @click="handleClick"
    >
        <div class="thumbnail" :style="`background-image: url('${videoThumbnail}');`"></div>
        
        <div class="user">
            <img :src="user.avatar" alt="User Avatar" />
            <div class="meta">
                <div class="username">{{ user.username }}</div>
                <div class="pronouns" v-if="user.pronouns">{{ user.pronouns }}</div>
                <div class="tags" v-if="user.isPatreon || user.isVerified">
                    <span class="tag tag-verified" v-if="user.isVerified">
                        <span class="mdi mdi-check"></span>
                        <span>{{ t('user.verified') }}</span>
                    </span>
                    <span class="tag tag-supporter" v-if="user.isPatreon">
                        <span class="mdi mdi-heart"></span>
                        <span>{{ t('user.supporter') }}</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    videoThumbnail: {
        type: [String, Boolean],
        default: false,
    },
});

const handleClick = () => {
    window.external.sendMessage(JSON.stringify({
        command: "open-in-browser",
        data: props.videoUrl,
    }));
};
</script>

<style lang="scss" scoped>
.spinplay-item {
    background: rgba(var(--colorBaseText), 0.07);
    border-radius: 6px;
    display: grid;
    overflow: hidden;
    transition: 0.15s ease-in-out all;
    
    & .thumbnail {
        width: 100%;
        aspect-ratio: 16 / 9;
        background-color: rgba(var(--colorBaseText, 0.07));
        background-size: cover;
        background-position: center;
    }

    & .user {
        padding: 15px;
        display: grid;
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
    }
    
    &:hover {
        background: rgba(var(--colorBaseText),0.14);
        cursor: pointer;
    }
}
</style>