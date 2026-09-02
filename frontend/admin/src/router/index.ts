import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ParticipantsView from '../views/ParticipantsView.vue';
import FloorsView from '../views/FloorsView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';
import LoginView from '../views/LoginView.vue';
import { useAdminStore } from '../store/adminStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/participants',
      name: 'participants',
      component: ParticipantsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/floors',
      name: 'floors',
      component: FloorsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const store = useAdminStore();
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
