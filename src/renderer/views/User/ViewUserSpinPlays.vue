<template>
    <section
        class="section-center py-30"
        v-if="!spinPlays"
    >
        <Loader />
    </section>
    <section
        class="page-user-spin-plays"
        v-else
    >
        <EmptyState
            v-if="spinPlays.length === 0"
            label="No SpinPlays yet."
            icon="youtube"
        />
        <SpinPlaysGrid v-else>
            <SpinPlayItem
                v-for="spinPlay in spinPlays"
                :key="spinPlay.id"
                v-bind="spinPlay"
            />
        </SpinPlaysGrid>
    </section>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SpinPlayItem from '@/components/SpinPlays/SpinPlayItem.vue';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';
import SpinPlaysGrid from '@/components/SpinPlays/SpinPlaysGrid.vue';

const api = inject('api');
const route = useRoute();
const userId = route.params.userId;
const spinPlays = ref(null);

onMounted(async () => {
    spinPlays.value = (await api.getUserSpinPlays(userId)) || [];
});
</script>

<style scoped>
.page-user-spin-plays {
    @apply p-10;
}
</style>
