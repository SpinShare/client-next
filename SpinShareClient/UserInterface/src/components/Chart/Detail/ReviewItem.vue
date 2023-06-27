<template>
    <div class="review-item">
        <div class="user">
            <img :src="user.avatar" alt="User Avatar" />
            <div class="meta">
                <div class="username">{{ user.username }}</div>
                <div class="pronouns" v-if="user.pronouns">{{ user.pronouns }}</div>
                <div class="tags" v-if="user.isPatreon || user.isVerified">
                    <span class="tag tag-verified" v-if="user.isVerified">
                        <span class="mdi mdi-check"></span>
                        <span>Verified</span>
                    </span>
                    <span class="tag tag-supporter" v-if="user.isPatreon">
                        <span class="mdi mdi-heart"></span>
                        <span>Supporter</span>
                    </span>
                </div>
            </div>
        </div>
        
        <p v-if="comment" class="comment">{{ comment }}</p>
        
        <div class="meta">
            <div class="tag-recommended" v-if="recommended">
                Recommended
            </div>
            <div class="review-date">
                <span class="mdi mdi-calendar-clock-outline"></span>
                <span>{{ relativeReviewDate }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import moment from 'moment';

const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
    recommended: {
        type: Boolean,
        default: false,
    },
    comment: {
        type: [String, Boolean],
        default: false,
    },
    reviewDate: {
        type: Object,
        required: true,
    },
});

const relativeReviewDate = computed(() => moment(props.reviewDate.date).startOf("minute").fromNow());
</script>

<style lang="scss" scoped>
.review-item {
    border: 1px solid rgba(var(--colorBaseText),0.07);
    padding: 15px;
    border-radius: 6px;
    display: grid;
    gap: 15px;
    
    & .user {
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
    
    & .comment {
        line-height: 1.5rem;
        -webkit-user-select: text;
        -moz-user-select: text;
        user-select: text;
        cursor: text;
    }
    
    & > .meta {
        display: flex;
        gap: 10px;
        align-items: center;
        
        & .review-date {
            display: flex;
            gap: 5px;
            align-items: center;
            color: rgba(var(--colorBaseText),0.4);
            
            & > span:nth-child(2) {
                font-size: 0.75rem;
            }
        }
        
        & .tag-recommended {
            padding: 5px 10px;
            border-radius: 100px;
            font-size: 0.75rem;
            background: rgba(var(--colorSuccess), 0.2);
            color: rgba(var(--colorSuccess));
        }
    }
}
</style>