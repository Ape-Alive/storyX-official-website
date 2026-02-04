/**
 * API 接口模块
 * 按业务模块划分，便于管理和维护
 */

import request from '@/utils/request'

/**
 * 示例 API
 */
export const exampleApi = {
  // 获取列表
  getList(params) {
    return request({
      url: '/example/list',
      method: 'get',
      params
    })
  },

  // 获取详情
  getDetail(id) {
    return request({
      url: `/example/detail/${id}`,
      method: 'get'
    })
  },

  // 创建
  create(data) {
    return request({
      url: '/example/create',
      method: 'post',
      data
    })
  },

  // 更新
  update(id, data) {
    return request({
      url: `/example/update/${id}`,
      method: 'put',
      data
    })
  },

  // 删除
  delete(id) {
    return request({
      url: `/example/delete/${id}`,
      method: 'delete'
    })
  }
}

// 可以继续添加其他业务模块的 API
// export const userApi = { ... }
// export const productApi = { ... }
