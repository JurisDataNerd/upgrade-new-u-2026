import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import PetaView from '@/views/PetaView.vue';
import PlayView from '@/views/PlayView.vue';
import FloorIntroView from '@/views/FloorIntroView.vue';
import LinearSpotView from '@/views/LinearSpotView.vue';
import FloorCompleteView from '@/views/FloorCompleteView.vue';
import BoothDetailView from '@/views/BoothDetailView.vue';
import PasporView from '@/views/PasporView.vue';
import LeaderboardView from '@/views/LeaderboardView.vue';
import BantuanView from '@/views/BantuanView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/peta',
    name: 'peta',
    component: PetaView,
  },
  {
    path: '/play',
    name: 'play',
    component: PlayView,
  },
  {
    path: '/play/floor/:floorId/intro',
    name: 'floor-intro',
    component: FloorIntroView,
  },
  {
    path: '/play/floor/:floorId/spot/:spotId',
    name: 'linear-spot',
    component: LinearSpotView,
  },
  {
    path: '/play/floor/:floorId/complete',
    name: 'floor-complete',
    component: FloorCompleteView,
  },
  {
    path: '/booth/:id',
    name: 'booth-detail',
    component: BoothDetailView,
  },
  {
    path: '/paspor',
    name: 'paspor',
    component: PasporView,
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: LeaderboardView,
  },
  {
    path: '/bantuan',
    name: 'bantuan',
    component: BantuanView,
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
