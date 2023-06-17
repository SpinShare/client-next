<template>
    <section class="user-detail-tab-overview">
        <div
            v-for="card in cards"
            class="card"
        >
            <img :src="card.icon" />
            <div class="meta">
                <h1>{{ card.title }}</h1>
                <p>{{ parseDescription(card.description) }}</p>
                <div class="given-date">
                    <span class="mdi mdi-calendar-clock-outline"></span>
                    <span>{{ getRelativeDate(card.givenDate.date) }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import {computed} from "vue";
import moment from "moment/moment";

const props = defineProps({
    cards: {
        type: Array,
        default: () => [],
    },
});

const getRelativeDate = (date) => {
    return moment(date).startOf("minute").fromNow();
};

const parseDescription = (description) => {
    return description.replace("\\'", "'");
};
</script>

<style lang="scss" scoped>
.user-detail-tab-overview {
    padding: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    
    & .card {
        border: 1px solid rgba(var(--colorBaseText),0.07);
        padding: 15px;
        border-radius: 6px;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 15px;
        align-items: center;
        
        & img {
            width: 100px;
            height: 100px;
        }
        & .meta {
            display: flex;
            flex-direction: column;
            gap: 5px;
            
            & h1 {
                font-size: 1rem;
            }
            & p {
                color: rgba(var(--colorBaseText),0.6);
                line-height: 1.15rem;
                font-size: 0.9rem;
            }
            & .given-date {
                margin-top: 10px;
                display: flex;
                gap: 5px;
                align-items: center;
                color: rgba(var(--colorBaseText),0.4);

                & > span:nth-child(2) {
                    font-size: 0.75rem;
                }
            }
        }
    }
}

@media screen and (max-width: 1200px) {
    .user-detail-tab-overview {
        grid-template-columns: 1fr 1fr;
    }
}

@media screen and (max-width: 800px) {
    .user-detail-tab-overview {
        grid-template-columns: 1fr;
    }
}
</style>