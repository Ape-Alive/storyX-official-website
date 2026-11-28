import request from '@/utils/request'

/**
 * 我的邀请 / 分销信息（终端用户）
 * GET /api/user/invite/me
 */
export const getMyInvite = () => {
  return request({
    url: '/user/invite/me',
    method: 'get',
  })
}
