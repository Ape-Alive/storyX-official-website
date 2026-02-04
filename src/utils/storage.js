/**
 * 浏览器存储工具类
 * 支持 localStorage 和 sessionStorage
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

/**
 * localStorage 操作
 */
export const local = {
  /**
   * 设置 localStorage
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      const stringValue = JSON.stringify(value)
      localStorage.setItem(key, stringValue)
    } catch (error) {
      console.error('localStorage set error:', error)
    }
  },

  /**
   * 获取 localStorage
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('localStorage get error:', error)
      return defaultValue
    }
  },

  /**
   * 删除 localStorage
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage remove error:', error)
    }
  },

  /**
   * 清空 localStorage
   */
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('localStorage clear error:', error)
    }
  }
}

/**
 * sessionStorage 操作
 */
export const session = {
  /**
   * 设置 sessionStorage
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      const stringValue = JSON.stringify(value)
      sessionStorage.setItem(key, stringValue)
    } catch (error) {
      console.error('sessionStorage set error:', error)
    }
  },

  /**
   * 获取 sessionStorage
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const value = sessionStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('sessionStorage get error:', error)
      return defaultValue
    }
  },

  /**
   * 删除 sessionStorage
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('sessionStorage remove error:', error)
    }
  },

  /**
   * 清空 sessionStorage
   */
  clear() {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('sessionStorage clear error:', error)
    }
  }
}

/**
 * Token 相关操作
 */
export const getToken = () => {
  return local.get(TOKEN_KEY) || session.get(TOKEN_KEY)
}

export const setToken = (token, remember = false) => {
  if (remember) {
    local.set(TOKEN_KEY, token)
  } else {
    session.set(TOKEN_KEY, token)
  }
}

export const removeToken = () => {
  local.remove(TOKEN_KEY)
  session.remove(TOKEN_KEY)
}

/**
 * 用户信息相关操作
 */
export const getUserInfo = () => {
  return local.get(USER_INFO_KEY) || session.get(USER_INFO_KEY)
}

export const setUserInfo = (userInfo, remember = false) => {
  if (remember) {
    local.set(USER_INFO_KEY, userInfo)
  } else {
    session.set(USER_INFO_KEY, userInfo)
  }
}

export const removeUserInfo = () => {
  local.remove(USER_INFO_KEY)
  session.remove(USER_INFO_KEY)
}
