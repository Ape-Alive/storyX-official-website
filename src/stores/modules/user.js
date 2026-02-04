import { defineStore } from 'pinia'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
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

    // 登录
    login(token, userInfo, remember = false) {
      this.setToken(token, remember)
      this.setUserInfo(userInfo, remember)
    },

    // 登出
    logout() {
      this.token = ''
      this.userInfo = null
      removeToken()
      removeUserInfo()
    }
  }
})
