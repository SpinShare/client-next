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
        path: '/discover/new/:page',
        component: ViewDiscoverNew,
    },
    {
        path: '/discover/updated/:page',
        component: ViewDiscoverUpdated,
    },
    {
        path: '/discover/hotThisWeek/:page',
        component: ViewDiscoverHotThisWeek,
    },
    {
        path: '/discover/hotThisMonth/:page',
        component: ViewDiscoverHotThisMonth,
    },
    {
        path: '/chart/:chartId',
        component: ViewChartDetail,
    },
    {
        path: '/chart/:chartId/playlists',
        component: ViewChartPlaylists,
    },
    {
        path: '/chart/:chartId/reviews',
        component: ViewChartReviews,
    },
    {
        path: '/chart/:chartId/spinplays',
        component: ViewChartSpinPlays,
    },
    {
        path: '/playlist/:playlistId',
        component: ViewPlaylistDetail,
    },
    {
        path: '/user/:userId',
        component: ViewUserDetail,
    },
    {
        path: '/user/:userId/playlists',
        component: ViewUserPlaylists,
    },
    {
        path: '/user/:userId/reviews',
        component: ViewUserReviews,
    },
    {
        path: '/user/:userId/spinplays',
        component: ViewUserSpinPlays,
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

export default router;
