import * as VueRouter from 'vue-router';
import ViewDiscover from './views/Discover/ViewDiscover.vue';
import ViewSearch from '@/views/ViewSearch.vue';
import ViewDiscoverNew from '@/views/Discover/ViewDiscoverNew.vue';
import ViewDiscoverUpdated from '@/views/Discover/ViewDiscoverUpdated.vue';
import ViewDiscoverHotThisWeek from '@/views/Discover/ViewDiscoverHotThisWeek.vue';
import ViewDiscoverHotThisMonth from '@/views/Discover/ViewDiscoverHotThisMonth.vue';
import ViewDiscoverStaffpicks from '@/views/Discover/ViewDiscoverStaffpicks.vue';
import ViewChartDetail from '@/views/Chart/ViewChartDetail.vue';
import ViewChartPlaylists from '@/views/Chart/ViewChartPlaylists.vue';
import ViewChartReviews from '@/views/Chart/ViewChartReviews.vue';
import ViewChartSpinPlays from '@/views/Chart/ViewChartSpinPlays.vue';
import ViewPlaylistDetail from '@/views/Playlist/ViewPlaylistDetail.vue';
import ViewUserDetail from '@/views/User/ViewUserDetail.vue';
import ViewUserPlaylists from '@/views/User/ViewUserPlaylists.vue';
import ViewUserReviews from '@/views/User/ViewUserReviews.vue';
import ViewUserSpinPlays from '@/views/User/ViewUserSpinPlays.vue';
import ViewSettings from '@/views/ViewSettings.vue';
import ViewLibrary from '@/views/Library/ViewLibrary.vue';
import ViewLibraryCleanup from '@/views/Library/ViewLibraryCleanup.vue';
import ViewSetupGeneral from '@/views/Setup/ViewSetupGeneral.vue';
import LayoutChart from '@/layouts/LayoutChart.vue';
import LayoutDiscover from '@/layouts/LayoutDiscover.vue';
import LayoutUser from '@/layouts/LayoutUser.vue';

const routes = [
    {
        path: '/',
        component: ViewDiscover,
    },
    {
        path: '/discover/search',
        component: ViewSearch,
    },
    {
        path: '/discover/staffpicks/:page',
        component: ViewDiscoverStaffpicks,
    },
    {
        path: '/discover',
        component: LayoutDiscover,
        children: [
            {
                path: 'new/:page',
                component: ViewDiscoverNew,
            },
            {
                path: 'updated/:page',
                component: ViewDiscoverUpdated,
            },
            {
                path: 'hotThisWeek/:page',
                component: ViewDiscoverHotThisWeek,
            },
            {
                path: 'hotThisMonth/:page',
                component: ViewDiscoverHotThisMonth,
            },
        ],
    },
    {
        path: '/chart/:chartId',
        component: LayoutChart,
        children: [
            {
                path: '',
                component: ViewChartDetail,
            },
            {
                path: 'playlists',
                component: ViewChartPlaylists,
            },
            {
                path: 'reviews',
                component: ViewChartReviews,
            },
            {
                path: 'spinplays',
                component: ViewChartSpinPlays,
            },
        ],
    },
    {
        path: '/playlist/:playlistId',
        component: ViewPlaylistDetail,
    },
    {
        path: '/user/:userId',
        component: LayoutUser,
        children: [
            {
                path: '',
                component: ViewUserDetail,
            },
            {
                path: 'playlists',
                component: ViewUserPlaylists,
            },
            {
                path: 'reviews',
                component: ViewUserReviews,
            },
            {
                path: 'spinplays',
                component: ViewUserSpinPlays,
            },
        ],
    },
    {
        path: '/settings',
        component: ViewSettings,
    },
    {
        path: '/library',
        component: ViewLibrary,
    },
    {
        path: '/library/cleanup',
        component: ViewLibraryCleanup,
    },
    {
        path: '/setup',
        component: ViewSetupGeneral,
    },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

router.beforeEach((_to, from, next) => {
    router.from = from;
    next();
});

export default router;
