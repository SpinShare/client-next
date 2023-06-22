<template>
    <AppLayout>
        <SpinTabBar
            :selected="currentTab"
            :tabs="['New', 'Updated', 'Hot this week', 'Hot this month']"
            @change="handleTabChange"
        />
        <transition name="default">
            <section
                v-if="charts"
                class="view-discover-new"
            >
                <section>
                    <ChartList
                        :charts="charts"
                    />
                    
                    <SpinHeader>
                        <SpinButton
                            icon="menu-left"
                            :disabled="currentPage < 1"
                            @click="navigatePrevious"
                        />
                        <SpinButton
                            :label="`Page #${currentPage}`"
                            :disabled="true"
                            color="transparent"
                        />
                        <SpinButton
                            icon="menu-right"
                            :disabled="charts.length < 12"
                            @click="navigateNext"
                        />
                    </SpinHeader>
                </section>
            </section>
        </transition>
        <section
            v-if="!charts"
            class="view-discover-loading"
        >
            <SpinLoader />
        </section>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from "@/layouts/AppLayout.vue";
import ChartList from "@/components/Common/ChartList.vue";
import {getHotThisMonthCharts, getHotThisWeekCharts, getNewCharts, getUpdatedCharts} from "@/api/api";
import router from "@/router";
import {useRoute} from "vue-router";
import SpinButton from "@/components/Common/SpinButton.vue";
import SpinTabBar from "@/components/Common/SpinTabBar.vue";

const getTabIndex = (tabName) => {
    if (tabName === 'new') return 0;
    if (tabName === 'updated') return 1;
    if (tabName === 'hotThisWeek') return 2;
    if (tabName === 'hotThisMonth') return 3;

    return 0;
};

const getTabName = (tabIndex) => {
    if (tabIndex === 0) return 'new';
    if (tabIndex === 1) return 'updated';
    if (tabIndex === 2) return 'hotThisWeek';
    if (tabIndex === 3) return 'hotThisMonth';

    return 'new';
};

const route = useRoute();
const charts = ref(null);
const currentTab = ref(getTabIndex(route.params.tab));
const currentPage = ref(route.params.page);

onMounted(async () => {
    if(currentTab.value === 0) charts.value = await getNewCharts(currentPage.value);
    if(currentTab.value === 1) charts.value = await getUpdatedCharts(currentPage.value);;
    if(currentTab.value === 2) charts.value = await getHotThisWeekCharts(currentPage.value);
    if(currentTab.value === 3) charts.value = await getHotThisMonthCharts(currentPage.value);
});

const handleTabChange = (tabIndex) => {
    router.push({
        path: '/discover/' + getTabName(tabIndex) + '/0',
    });
};

const navigatePrevious = () => {
    if(currentPage.value < 1) return;
    
    currentPage.value--;
    router.push({
        path: '/discover/' + getTabName(currentTab.value) + '/' + currentPage.value,
    });
}
const navigateNext = () => {
    if(charts.value.length < 12) return;

    currentPage.value++;
    router.push({
        path: '/discover/' + getTabName(currentTab.value) + '/' + currentPage.value,
    });
}
</script>

<style lang="scss" scoped>
.view-discover-loading {
    min-height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.view-discover-new {
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;

    & > section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
}
</style>
