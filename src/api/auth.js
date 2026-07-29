import request from '@/utils/request'

/**
 * 发送注册邮箱验证码
 * @param {string} email - 邮箱地址
 * @returns {Promise}
 */
export const sendRegisterCode = (email) => {
  return request({
    url: '/auth/user/send-register-code',
    method: 'post',
    data: { email }
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.email - 邮箱地址
 * @param {string} data.password - 密码（6-50个字符）
 * @param {string} [data.activationCode] - 激活码（选填，填写则核销并绑定套餐）
 * @param {string} data.verificationCode - 6位数字邮箱验证码
 * @param {string} [data.deviceFingerprint] - 设备指纹（可选）
 * @returns {Promise}
 */
export const register = (data) => {
  return request({
    url: '/auth/user/register',
    method: 'post',
    data
  })
}

/**
 * 获取图形验证码
 * @returns {Promise<{ sessionId: string, imageUrl: string, expiresIn: number }>}
 */
export const getCaptcha = () => {
  return request({
    url: '/auth/captcha',
    method: 'get'
  })
}

/**
 * 发送重置密码邮箱验证码
 * @param {string} email
 * @param {string} captchaCode
 * @param {string} sessionId
 */
export const sendResetPasswordCode = (email, captchaCode, sessionId) => {
  return request({
    url: '/auth/user/send-reset-code',
    method: 'post',
    data: { email, captchaCode, sessionId }
  })
}

/**
 * 通过邮箱验证码重置密码
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.verificationCode
 * @param {string} data.newPassword
 */
export const resetPassword = (data) => {
  return request({
    url: '/auth/user/reset-password',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.email - 用户邮箱地址
 * @param {string} data.password - 用户密码
 * @param {string} data.captchaCode - 4位图形验证码
 * @param {string} data.sessionId - 验证码会话ID
 * @param {string} [data.deviceFingerprint] - 设备指纹（可选）
 * @returns {Promise}
 */
export const login = (data) => {
  return request({
    url: '/auth/user/login',
    method: 'post',
    data
  })
}

/**
 * 使用 refreshToken 刷新访问令牌
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const refreshAccessToken = (refreshToken) => {
  return request({
    url: '/auth/refresh',
    method: 'post',
    data: { refreshToken },
    skipAuthRefresh: true
  })
}

/**
 * 生成一次性token（用于桌面端登录）
 * @param {Object} [options] - 可选参数
 * @param {number} [options.expiresInMinutes] - 过期时间（分钟），默认10分钟，最长60分钟
 * @returns {Promise}
 */
export const generateOneTimeToken = (options = {}) => {
  return request({
    url: '/auth/one-time-token',
    method: 'post',
    data: {
      expiresInMinutes: options.expiresInMinutes || 10
    }
  })
}
