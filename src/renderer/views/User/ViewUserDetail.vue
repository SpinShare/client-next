<template>
    <section class="page-user-detail">
        <EmptyState
            v-if="user.cards.length === 0"
            label="No card yet."
            icon="award"
        />
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
import CardItem from '@/components/Charts/CardItem.vue';
import EmptyState from '@/components/EmptyState.vue';

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
