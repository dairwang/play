import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../pages/Index.vue') },
  { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../pages/Register.vue') },
  { path: '/user', name: 'User', component: () => import('../pages/User.vue') },
  { path: '/order/list', name: 'OrderList', component: () => import('../pages/OrderList.vue') },
  { path: '/apply', name: 'Apply', component: () => import('../pages/Apply.vue') },
  { path: '/companion/:id', name: 'CompanionDetail', component: () => import('../pages/CompanionDetail.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
