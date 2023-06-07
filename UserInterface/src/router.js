import * as VueRouter from 'vue-router';

import ViewSetupStep0 from './views/Setup/Step0.vue';
import ViewSetupStep1 from './views/Setup/Step1.vue';
import ViewSetupStep2 from './views/Setup/Step2.vue';
import ViewSetupStep3 from './views/Setup/Step3.vue';
import ViewSetupStep4 from './views/Setup/Step4.vue';

import ViewDiscover from './views/Discover.vue';
import ViewLibrary from './views/Library.vue';
import ViewSettings from './views/Settings.vue';
import ViewChartDetail from './views/Chart/Detail.vue';
import ViewPlaylistDetail from './views/Playlist/Detail.vue';
import ViewError from './views/Error.vue';

const routes = [
    {
        path: '/setup/step-0',
        component: ViewSetupStep0,
    },
    {
        path: '/setup/step-1',
        component: ViewSetupStep1,
    },
    {
        path: '/setup/step-2',
        component: ViewSetupStep2,
    },
    {
        path: '/setup/step-3',
        component: ViewSetupStep3,
    },
    {
        path: '/setup/step-4',
        component: ViewSetupStep4,
    },
    {
        path: '/',
        component: ViewDiscover,
    },
    {
        path: '/chart/:chartId',
        component: ViewChartDetail,
    },
    {
        path: '/playlist/:playlistId',
        component: ViewPlaylistDetail,
    },
    {
        path: '/library',
        component: ViewLibrary,
    },
    {
        path: '/settings',
        component: ViewSettings,
    },
    {
        path: "/:pathMatch(.*)*",
        component: ViewError
    },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

export default router;