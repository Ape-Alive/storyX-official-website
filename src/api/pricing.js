/**
 * 订阅套餐 API
 */
import request from '@/utils/request'

/**
 * 获取可订阅的套餐列表
 * 后端仅返回 isActive && showOnWebsite 的套餐；官网再按周期筛选。
 * @param {string} [type] - free | paid | trial
 * @param {string} [durationUnit] - day | month | year | permanent
 */
export const getAvailablePackages = (type, durationUnit) => {
    const params = {}
    if (type) {
        params.type = type
    }
    if (durationUnit) {
        params.durationUnit = durationUnit
    }
    return request({
        url: '/user/packages/available',
        method: 'get',
        params
    })
}

/**
 * 获取我的套餐列表
 * @param {Object} params - 查询参数
 * @param {boolean} [params.activeOnly] - 是否只返回活跃套餐
 * @param {number} [params.page] - 页码（从1开始）
 * @param {number} [params.pageSize] - 每页数量
 * @returns {Promise}
 */
export const getMyPackages = (params = {}) => {
    return request({
        url: '/user/packages/my-packages',
        method: 'get',
        params
    })
}
