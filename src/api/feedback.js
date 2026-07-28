import request from '@/utils/request'

/**
 * 提交客户反馈 [终端用户]
 * @param {{ name: string, email: string, phone: string, content: string }} data
 */
export const submitFeedback = (data) => {
  return request({
    url: '/user/feedbacks',
    method: 'post',
    data
  })
}
