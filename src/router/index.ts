import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home-View.vue')
    }, {
      path: '/gpt',
      name: 'gpt',
      component: () => import('@/views/gpt/Gpt-View.vue')
    }
  ]
})

export default router
