/**
 * 订阅套餐 API
 */
import request from '@/utils/request'

/**
 * 获取可订阅的套餐列表
 * @param {string} type - 套餐类型筛选：free（免费套餐）、paid（付费套餐）、trial（试用套餐）
 * @returns {Promise}
 */
export const getAvailablePackages = (type) => {
    return request({
        url: '/user/packages/available',
        method: 'get',
        params: type ? { type } : {}
    })
}
