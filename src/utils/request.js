import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, getRefreshToken, saveAuthTokens, removeToken, removeUserInfo } from './storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建 axios 实例
const service = axios.create({
    baseURL,
    timeout: 10000
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
}

const tryRefreshToken = async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
        return null
    }

    const response = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
    )

    const body = response.data
    if (body?.success && body.data) {
        saveAuthTokens(body.data)
        return body.data.accessToken || body.data.token
    }

    return null
}

const redirectToLogin = () => {
    removeToken()
    removeUserInfo()
    if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login'
    }
}

const shouldAttemptTokenRefresh = (config) => {
    if (!config || config.skipAuthRefresh) {
        return false
    }
    const url = config.url || ''
    return !url.includes('/auth/user/login') &&
        !url.includes('/auth/user/register') &&
        !url.includes('/auth/refresh')
}

// 请求拦截器
service.interceptors.request.use(
    config => {
        const token = getToken()
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data

        if (res.code !== undefined && res.code !== 200) {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message || '请求失败'))
        }

        return res
    },
    async error => {
        console.error('响应错误:', error)

        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            shouldAttemptTokenRefresh(originalRequest)
        ) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`
                        resolve(service(originalRequest))
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const newToken = await tryRefreshToken()
                if (!newToken) {
                    redirectToLogin()
                    return Promise.reject(error)
                }

                onTokenRefreshed(newToken)
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                return service(originalRequest)
            } catch (refreshError) {
                redirectToLogin()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        let message = '请求失败'

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    message = '未授权，请重新登录'
                    break
                case 403:
                    message = '拒绝访问'
                    break
                case 404:
                    message = '请求错误，未找到该资源'
                    break
                case 500:
                    message = '服务器错误'
                    break
                default:
                    message = `连接错误${error.response.status}`
            }
        } else if (error.request) {
            message = '网络连接失败'
        }

        ElMessage.error(message)
        return Promise.reject(error)
    }
)

export default service
