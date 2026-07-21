import { defineStore } from 'pinia'
import {
  getToken,
  getRefreshToken,
  setToken,
  saveAuthTokens,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo
} from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    refreshToken: getRefreshToken() || '',
    userInfo: getUserInfo() || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.name || ''
  },

  actions: {
    // 设置 token
    setToken(token, remember = false) {
      this.token = token
      setToken(token, remember)
    },

    // 设置用户信息
    setUserInfo(userInfo, remember = false) {
      this.userInfo = userInfo
      setUserInfo(userInfo, remember)
    },

    // 登录（支持 accessToken / token / refreshToken）
    login(tokens, userInfo, remember = false) {
      if (typeof tokens === 'string') {
        this.setToken(tokens, remember)
      } else {
        saveAuthTokens(tokens, remember)
        this.token = getToken() || ''
        this.refreshToken = getRefreshToken() || ''
      }
      this.setUserInfo(userInfo, remember)
    },

    // 登出
    logout() {
      this.token = ''
      this.refreshToken = ''
      this.userInfo = null
      removeToken()
      removeUserInfo()
    }
  }
})
