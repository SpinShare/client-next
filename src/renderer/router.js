import * as VueRouter from 'vue-router';
import ViewDiscover from './views/ViewDiscover.vue';

const routes = [
    {
        path: '/',
        component: ViewDiscover,
    },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

export default router;
