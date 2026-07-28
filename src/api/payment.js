/**
 * 支付 API（前端不暴露第三方支付渠道信息）
 */
import request from '@/utils/request'

/**
 * 发起支付
 * @param {string} orderId
 * @param {{
 *   paymentMethod: 'alipay',
 *   returnUrl?: string,
 *   device?: string
 * }} data
 */
export const createPayment = (orderId, data) => {
  return request({
    url: `/user/orders/${orderId}/payment`,
    method: 'post',
    data
  })
}

/**
 * 主动查询支付状态
 */
export const queryPaymentStatus = (paymentId) => {
  return request({
    url: `/user/payments/${paymentId}/query`,
    method: 'post'
  })
}

/**
 * 支付详情
 */
export const getPaymentDetail = (paymentId) => {
  return request({
    url: `/user/payments/${paymentId}`,
    method: 'get'
  })
}
