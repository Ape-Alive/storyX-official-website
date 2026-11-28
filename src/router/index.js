import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { getToken } from '@/utils/storage'
import { isMobileDevice } from '@/utils/device'

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
        path: 'resources',
        name: 'Resources',
        component: () => import('@/views/Resources.vue')
      },
      {
        path: 'payment/return',
        name: 'PaymentReturn',
        component: () => import('@/views/PaymentReturn.vue'),
        meta: { requiresAuth: true }
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
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/ForgotPassword.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    redirect: '/dashboard/usage',
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
        path: 'account',
        component: () => import('@/views/dashboard/account/AccountView.vue'),
        children: [
          {
            path: '',
            name: 'DashboardAccount',
            component: {
              name: 'AccountHubBlank',
              render() {
                return null
              },
            },
          },
          {
            path: 'packages',
            name: 'DashboardAccountPackages',
            component: () => import('@/views/dashboard/account/MyPackagesView.vue'),
            props: { embedded: true },
          },
          {
            path: 'orders',
            name: 'DashboardAccountOrders',
            component: () => import('@/views/dashboard/OrdersView.vue'),
            props: { embedded: true },
          },
          {
            path: 'profile',
            name: 'DashboardAccountProfile',
            component: () => import('@/views/dashboard/account/ProfileView.vue'),
            props: { embedded: true },
          },
          {
            path: 'invite',
            name: 'DashboardAccountInvite',
            component: () => import('@/views/dashboard/account/InviteView.vue'),
            props: { embedded: true },
          },
          {
            path: 'contact',
            name: 'DashboardAccountContact',
            component: () => import('@/views/dashboard/ContactView.vue'),
            props: { embedded: true },
          },
        ],
      },
      {
        path: 'orders',
        redirect: () =>
          isMobileDevice()
            ? '/dashboard/account/orders'
            : { path: '/dashboard/account', hash: '#orders' },
      },
      {
        path: 'docs',
        name: 'DashboardDocs',
        component: () => import('@/views/dashboard/DocsView.vue')
      },
      {
        path: 'contact',
        redirect: () =>
          isMobileDevice()
            ? '/dashboard/account/contact'
            : { path: '/dashboard/account', hash: '#contact' },
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
  },
  {
    path: '/forgot-password',
    redirect: '/auth/forgot-password'
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
  else if (
    token &&
    (to.path === '/auth/login' || to.path === '/auth/register' || to.path === '/auth/forgot-password')
  ) {
    next('/dashboard/usage')
  }
  // PC：账户子路径回到单页锚点；移动端走子页
  else if (
    !isMobileDevice() &&
    /^\/dashboard\/account\/(packages|orders|profile|invite|contact)\/?$/.test(to.path)
  ) {
    const section = to.path.split('/').pop()
    next({ path: '/dashboard/account', hash: `#${section}` })
  } else {
    next()
  }
})

export default router
