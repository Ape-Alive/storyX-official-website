/** 移动端「个人中心」菜单（黑灰主题） */
export const mobileAccountMenus = [
  {
    id: 'packages',
    label: '我的套餐',
    desc: '查看已购会员与积分额度',
    path: '/dashboard/account/packages',
    vantIcon: 'gift-o',
  },
  {
    id: 'orders',
    label: '财务订单',
    desc: '订阅与支付记录',
    path: '/dashboard/account/orders',
    vantIcon: 'orders-o',
  },
  {
    id: 'invite',
    label: '客户端邀请',
    desc: '邀请码与奖励策略',
    path: '/dashboard/account/invite',
    vantIcon: 'friends-o',
  },
  {
    id: 'contact',
    label: '技术支持',
    desc: '联系专家团队',
    path: '/dashboard/account/contact',
    vantIcon: 'service-o',
  },
  {
    id: 'profile',
    label: '我的信息',
    desc: '账号基础资料',
    path: '/dashboard/account/profile',
    vantIcon: 'user-o',
  },
]

/** PC 单页分区锚点 */
export const accountSections = [
  { id: 'packages', label: '我的套餐', hash: '#packages' },
  { id: 'orders', label: '财务订单', hash: '#orders' },
  { id: 'profile', label: '个人信息', hash: '#profile' },
  { id: 'invite', label: '客户端邀请', hash: '#invite' },
  { id: 'contact', label: '联系我们', hash: '#contact' },
]

export const accountNavItems = mobileAccountMenus

export function isAccountNavActive(routePath, itemPath) {
  return routePath === itemPath || routePath.startsWith(`${itemPath}/`)
}
