import { TrendCharts, Box, User } from '@element-plus/icons-vue'

/** 桌面侧栏：监控 / 会员计划 / 我的 */
export const desktopNavItems = [
  {
    id: 'usage',
    label: '使用监控',
    shortLabel: '监控',
    iconComponent: TrendCharts,
    vantIcon: 'chart-trending-o',
    path: '/dashboard/usage',
  },
  {
    id: 'plans',
    label: '会员计划',
    shortLabel: '会员',
    iconComponent: Box,
    vantIcon: 'gift-o',
    path: '/dashboard/plans',
  },
  {
    id: 'account',
    label: '我的',
    shortLabel: '我的',
    iconComponent: User,
    vantIcon: 'user-o',
    path: '/dashboard/account',
  },
]

/** 移动底栏：监控 / 会员 / 我的 */
export const mobileNavItems = [
  {
    id: 'usage',
    label: '首页',
    shortLabel: '首页',
    iconComponent: TrendCharts,
    vantIcon: 'home-o',
    path: '/dashboard/usage',
  },
  {
    id: 'plans',
    label: '会员计划',
    shortLabel: '会员',
    iconComponent: Box,
    vantIcon: 'gift-o',
    path: '/dashboard/plans',
  },
  {
    id: 'account',
    label: '我的',
    shortLabel: '我的',
    iconComponent: User,
    vantIcon: 'user-o',
    path: '/dashboard/account',
  },
]

/** @deprecated 兼容旧引用，默认桌面项 */
export const dashboardNavItems = desktopNavItems

export function getDashboardNavItems(isMobile) {
  return isMobile ? mobileNavItems : desktopNavItems
}

export function isDashboardNavActive(routePath, itemPath) {
  if (itemPath === '/dashboard/account') {
    return routePath === itemPath || routePath.startsWith('/dashboard/account/')
  }
  return (
    routePath === itemPath ||
    (itemPath === '/dashboard/home' && routePath === '/dashboard')
  )
}
