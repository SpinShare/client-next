<template>
    <section class="user-list">
        <UserItem
            v-for="user in users"
            :key="user.id"
            v-bind="user"
        />
    </section>
</template>

<script setup>
import UserItem from "@/components/Common/UserItem.vue";

defineProps({
    users: {
        type: Array,
        default: () => [],
    }
});
</script>

<style lang="scss" scoped>
.user-list {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr;
}

@media screen and (min-width: 1400px) {
    .user-list {
        grid-template-columns: 1fr 1fr 1fr;
    }
}

@media screen and (max-width: 1000px) {
    .user-list {
        grid-template-columns: 1fr;
    }
}
</style>