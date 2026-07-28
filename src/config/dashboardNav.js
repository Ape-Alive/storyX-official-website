import { DataBoard, TrendCharts, Box, CreditCard, Message } from '@element-plus/icons-vue'

/** 桌面侧栏导航 */
export const desktopNavItems = [
  {
    id: 'dashboard',
    label: '控制台首页',
    shortLabel: '首页',
    iconComponent: DataBoard,
    vantIcon: 'home-o',
    path: '/dashboard/home'
  },
  {
    id: 'usage',
    label: '使用监控',
    shortLabel: '监控',
    iconComponent: TrendCharts,
    vantIcon: 'chart-trending-o',
    path: '/dashboard/usage'
  },
  {
    id: 'plans',
    label: '套餐计划',
    shortLabel: '套餐',
    iconComponent: Box,
    vantIcon: 'gift-o',
    path: '/dashboard/plans'
  },
  {
    id: 'orders',
    label: '财务订单',
    shortLabel: '订单',
    iconComponent: CreditCard,
    vantIcon: 'orders-o',
    path: '/dashboard/orders'
  },
  {
    id: 'contact',
    label: '联系我们',
    shortLabel: '联系',
    iconComponent: Message,
    vantIcon: 'envelop-o',
    path: '/dashboard/contact'
  }
]

/** 移动底栏：监控作为首页 */
export const mobileNavItems = [
  {
    id: 'usage',
    label: '首页',
    shortLabel: '首页',
    iconComponent: TrendCharts,
    vantIcon: 'home-o',
    path: '/dashboard/usage'
  },
  {
    id: 'plans',
    label: '套餐计划',
    shortLabel: '套餐',
    iconComponent: Box,
    vantIcon: 'gift-o',
    path: '/dashboard/plans'
  },
  {
    id: 'orders',
    label: '财务订单',
    shortLabel: '订单',
    iconComponent: CreditCard,
    vantIcon: 'orders-o',
    path: '/dashboard/orders'
  },
  {
    id: 'contact',
    label: '联系我们',
    shortLabel: '联系',
    iconComponent: Message,
    vantIcon: 'envelop-o',
    path: '/dashboard/contact'
  }
]

/** @deprecated 兼容旧引用，默认桌面项 */
export const dashboardNavItems = desktopNavItems

export function getDashboardNavItems(isMobile) {
  return isMobile ? mobileNavItems : desktopNavItems
}

export function isDashboardNavActive(routePath, itemPath) {
  return (
    routePath === itemPath ||
    (itemPath === '/dashboard/home' && routePath === '/dashboard')
  )
}
