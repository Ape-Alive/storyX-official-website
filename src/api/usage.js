import request from '@/utils/request'

/**
 * 获取我的使用趋势 [仅终端用户]
 * @param {Object} params - 查询参数
 * @param {string} [params.startDate] - 开始时间，ISO 8601格式
 * @param {string} [params.endDate] - 结束时间，ISO 8601格式
 * @param {string} [params.period] - 时间段类型：day/week/month，默认为 "day"
 * @returns {Promise}
 */
export const getUsageTrend = (params = {}) => {
  return request({
    url: '/user/quotas/usage/trend',
    method: 'get',
    params
  })
}

/**
 * 获取调用日志列表 [仅终端用户]
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码，默认为 1
 * @param {number} [params.pageSize] - 每页数量，默认为 20
 * @param {string} [params.modelId] - 模型ID筛选
 * @param {string} [params.status] - 调用状态筛选：success/failed/timeout/error
 * @param {string} [params.startDate] - 开始日期（ISO 8601格式）
 * @param {string} [params.endDate] - 结束日期（ISO 8601格式）
 * @returns {Promise}
 */
export const getAILogs = (params = {}) => {
  return request({
    url: '/user/ai/logs',
    method: 'get',
    params
  })
}

/**
 * 获取调用日志详情 [仅终端用户]
 * @param {string} requestId - 请求ID
 * @returns {Promise}
 */
export const getAILogDetail = (requestId) => {
  return request({
    url: `/user/ai/logs/${requestId}`,
    method: 'get'
  })
}

/**
 * 获取模型列表 [管理员/终端用户]
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码，默认为 1
 * @param {number} [params.pageSize] - 每页数量，默认为 20
 * @param {string} [params.type] - 模型类型筛选：llm/video/image/tts
 * @param {boolean} [params.isActive] - 是否启用
 * @returns {Promise}
 */
export const getModels = (params = {}) => {
  return request({
    url: '/models',
    method: 'get',
    params
  })
}
