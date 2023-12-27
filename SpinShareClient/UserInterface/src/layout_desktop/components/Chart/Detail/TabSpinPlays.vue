<template>
    <section class="chart-detail-tab-spinplays">
        <div
            class="spinplays-list"
            v-if="spinplays"
        >
            <SpinPlayItem
                v-for="spinplay in spinplays.spinPlays"
                :key="spinplay.id"
                v-bind="spinplay"
            />
        </div>
        <SpinLoader v-else />
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getChartSpinPlays } from '@/api/api';
import SpinPlayItem from '@/layout_desktop/components/Chart/Detail/SpinPlayItem.vue';

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const spinplays = ref(null);

onMounted(async () => {
    spinplays.value = await getChartSpinPlays(props.id);
});
</script>

<style lang="scss" scoped>
.chart-detail-tab-spinplays {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    & .spinplays-list {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
    }
}

@media screen and (max-width: 1200px) {
    .chart-detail-tab-spinplays {
        & .spinplays-list {
            grid-template-columns: 1fr 1fr;
        }
    }
}

@media screen and (max-width: 800px) {
    .chart-detail-tab-spinplays {
        & .spinplays-list {
            grid-template-columns: 1fr;
        }
    }
}
</style>
