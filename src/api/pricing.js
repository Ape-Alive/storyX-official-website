/**
 * 订阅套餐 API
 */
import request from '@/utils/request'

/**
 * 获取可订阅的套餐列表
 * 后端仅返回 isActive && showOnWebsite 的套餐；官网再按周期/角色筛选。
 * @param {string} [type] - free | paid | trial
 * @param {string} [durationUnit] - day | month | year | permanent
 * @param {string} [roleKey] - 套餐绑定的客户端角色标识，如 custom_base_user
 */
export const getAvailablePackages = (type, durationUnit, roleKey) => {
    const params = {}
    if (type) {
        params.type = type
    }
    if (durationUnit) {
        params.durationUnit = durationUnit
    }
    if (roleKey) {
        params.roleKey = roleKey
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

/**
 * 各版本功能比较（公开接口，数据来自后台功能点）
 * @param {string|string[]} [roleKeys]
 */
export const getFeatureCompare = (roleKeys) => {
    const params = {}
    if (Array.isArray(roleKeys) && roleKeys.length) {
        params.roleKeys = roleKeys.join(',')
    } else if (typeof roleKeys === 'string' && roleKeys.trim()) {
        params.roleKeys = roleKeys.trim()
    }
    return request({
        url: '/public/feature-compare',
        method: 'get',
        params
    })
}
