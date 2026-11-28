/** 「我的」账户中心二级导航（无概览） */
export const accountNavItems = [
  {
    id: 'packages',
    label: '我的套餐',
    path: '/dashboard/account/packages',
    vantIcon: 'gift-o',
  },
  {
    id: 'orders',
    label: '财务订单',
    path: '/dashboard/account/orders',
    vantIcon: 'orders-o',
  },
  {
    id: 'profile',
    label: '个人信息',
    path: '/dashboard/account/profile',
    vantIcon: 'user-o',
  },
  {
    id: 'invite',
    label: '客户端邀请',
    path: '/dashboard/account/invite',
    vantIcon: 'friends-o',
  },
  {
    id: 'contact',
    label: '联系我们',
    path: '/dashboard/account/contact',
    vantIcon: 'envelop-o',
  },
]

export function isAccountNavActive(routePath, itemPath) {
  return routePath === itemPath || routePath.startsWith(`${itemPath}/`)
}
