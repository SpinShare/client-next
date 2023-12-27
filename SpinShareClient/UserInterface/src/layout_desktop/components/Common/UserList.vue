<template>
    <section class="user-list">
        <template
            v-for="(user, i) in users"
            :key="user.id"
        >
            <UserItem
                v-bind="user"
                :style="`animation-delay: ${0.025 * i}s`"
            />
        </template>
    </section>
</template>

<script setup>
import UserItem from '@/layout_desktop/components/Common/UserItem.vue';

defineProps({
    users: {
        type: Array,
        default: () => [],
    },
});
</script>

<style lang="scss" scoped>
.user-list {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr;

    & .user-item {
        opacity: 0;
        animation: listEntrance 0.2s ease-in-out forwards;
    }
}

@media screen and (min-width: 1400px) {
    .user-list {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

@media screen and (min-width: 1850px) {
    .chart-list {
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
}

@media screen and (max-width: 1000px) {
    .user-list {
        grid-template-columns: 1fr;
    }
}
</style>
