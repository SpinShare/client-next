<template>
    <section class="user-detail-tab-charts">
        <ChartList
            v-if="charts"
            :charts="charts"
        />
        <SpinLoader v-else />
    </section>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {getUserCharts} from "@/api/api";
import ChartList from "@/layout_desktop/components/Common/ChartList.vue";

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const charts = ref(null);

onMounted(async () => {
    charts.value = await getUserCharts(props.id);
});
</script>

<style lang="scss" scoped>
.user-detail-tab-charts {
    padding: 40px;
}
</style>