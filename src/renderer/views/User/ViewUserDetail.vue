<template>
    <section class="page-user-detail">
        <div
            class="no-cards"
            v-if="user.cards.length === 0"
        >
            <Remixicon
                icon="award"
                size="3xl"
                filled
            />
            <span>No cards yet.</span>
        </div>
        <div
            class="cards-list"
            v-else
        >
            <CardItem
                v-for="card in user.cards"
                v-bind="card"
            />
        </div>
    </section>
</template>

<script setup>
import Remixicon from '@/components/Remixicon.vue';
import CardItem from '@/components/CardItem.vue';

const props = defineProps({
    user: {
        type: Object,
        default: null,
    },
});
</script>

<style scoped>
.page-user-detail {
    @apply p-10;

    & .no-cards {
        @apply flex flex-col items-center gap-1 py-5 text-base-400 border border-base-800 rounded-md;
    }
    & .cards-list {
        @apply grid grid-cols-1 gap-2.5;
    }
}
@media screen and (min-width: 1100px) {
    .page-user-detail {
        & .cards-list {
            @apply grid-cols-2;
        }
    }
}
</style>
