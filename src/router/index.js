import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { getToken } from '@/utils/storage'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'pricing',
        name: 'Pricing',
        component: () => import('@/views/Pricing.vue')
      },
      {
        path: 'workflow',
        name: 'Workflow',
        component: () => import('@/views/Workflow.vue')
      },
      {
        path: 'test',
        name: 'Test',
        component: () => import('@/views/Test.vue')
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Register.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    redirect: '/dashboard/home',
    children: [
      {
        path: 'home',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      {
        path: 'usage',
        name: 'DashboardUsage',
        component: () => import('@/views/dashboard/UsageView.vue')
      },
      {
        path: 'plans',
        name: 'DashboardPlans',
        component: () => import('@/views/dashboard/PlansView.vue')
      },
      {
        path: 'orders',
        name: 'DashboardOrders',
        component: () => import('@/views/dashboard/OrdersView.vue')
      },
      {
        path: 'docs',
        name: 'DashboardDocs',
        component: () => import('@/views/dashboard/DocsView.vue')
      },
      {
        path: 'contact',
        name: 'DashboardContact',
        component: () => import('@/views/dashboard/ContactView.vue')
      }
    ]
  },
  // 重定向旧路由到新路由
  {
    path: '/login',
    redirect: '/auth/login'
  },
  {
    path: '/register',
    redirect: '/auth/register'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = getToken()

  // 如果路由需要认证但用户未登录，重定向到登录页
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }
  // 如果已登录用户访问登录/注册页，重定向到仪表盘
  else if (token && (to.path === '/auth/login' || to.path === '/auth/register')) {
    next('/dashboard/home')
  }
  else {
    next()
  }
})

export default router
