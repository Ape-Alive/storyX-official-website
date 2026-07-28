/**
 * 订单 API
 */
import request from '@/utils/request'

/**
 * 创建订单
 * @param {{ packageId: string, type?: 'purchase'|'renewal'|'upgrade' }} data
 */
export const createOrder = (data) => {
  return request({
    url: '/user/orders',
    method: 'post',
    data
  })
}

/**
 * 我的订单列表
 */
export const getMyOrders = (params = {}) => {
  return request({
    url: '/user/orders',
    method: 'get',
    params
  })
}

/**
 * 订单详情
 */
export const getOrderDetail = (id) => {
  return request({
    url: `/user/orders/${id}`,
    method: 'get'
  })
}

/**
 * 取消待支付订单
 */
export const cancelOrder = (id) => {
  return request({
    url: `/user/orders/${id}/cancel`,
    method: 'post'
  })
}
