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
        <div
            class="no-spinplays"
            v-if="spinPlays.length === 0"
        >
            <Remixicon
                icon="youtube"
                size="3xl"
                filled
            />
            <span>No SpinPlays yet.</span>
        </div>
        <SpinPlayItem
            v-for="spinPlay in spinPlays"
            :key="spinPlay.id"
            v-bind="spinPlay"
        />
    </section>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SpinPlayItem from '@/components/SpinPlayItem.vue';
import Loader from '@/components/Loader.vue';
import Remixicon from '@/components/Remixicon.vue';

const api = inject('api');
const externalApi = inject('externalApi');
const route = useRoute();
const userId = route.params.userId;
const spinPlays = ref(null);

onMounted(async () => {
    spinPlays.value = (await api.getUserSpinPlays(userId)) || [];
});
</script>

<style scoped>
.page-user-spin-plays {
    @apply p-10 grid grid-cols-1 gap-2.5;

    & .no-spinplays {
        @apply flex flex-col items-center gap-1 py-5 text-base-400 border border-base-800 rounded-md col-span-full;
    }
}

@media screen and (min-width: 1100px) {
    .page-user-spin-plays {
        @apply grid-cols-2;
    }
}
@media screen and (min-width: 1300px) {
    .page-user-spin-plays {
        @apply grid-cols-3;
    }
}
@media screen and (min-width: 1800px) {
    .page-user-spin-plays {
        @apply grid-cols-4;
    }
}
</style>
