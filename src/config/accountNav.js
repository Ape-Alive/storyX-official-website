/** 「我的」单页分区锚点（与 AccountView 区块 id 对应） */
export const accountSections = [
  { id: 'packages', label: '我的套餐', hash: '#packages' },
  { id: 'orders', label: '财务订单', hash: '#orders' },
  { id: 'profile', label: '个人信息', hash: '#profile' },
  { id: 'invite', label: '客户端邀请', hash: '#invite' },
  { id: 'contact', label: '联系我们', hash: '#contact' },
]

/** @deprecated */
export const accountNavItems = accountSections.map((item) => ({
  ...item,
  path: `/dashboard/account${item.hash}`,
}))

export function isAccountNavActive() {
  return false
}
