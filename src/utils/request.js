import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, getRefreshToken, saveAuthTokens, removeToken, removeUserInfo } from './storage'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const PROVIDER_LEAK_RE =
    /\b(zpay|yungouos|yun\s*gou\s*os|易支付|码支付|alipay\.com|weixin\.qq|wx\.tenpay)\b/i

const toSafeClientMessage = (message, url = '') => {
    const text = String(message || '')
    const isPayment =
        String(url).includes('/payment') ||
        (String(url).includes('/orders/') && String(url).includes('payment'))
    if (isPayment || PROVIDER_LEAK_RE.test(text) || /API error|payment failed|query failed/i.test(text)) {
        return '支付处理失败，请稍后重试'
    }
    return text || '请求失败'
}

export const isNoEntitlementError = (error) =>
    error?.code === 'NO_ENTITLEMENT' ||
    error?.response?.data?.code === 'NO_ENTITLEMENT' ||
    error?.silent === true

let entitlementDialogShowing = false

/**
 * 无套餐权益时弹窗引导订阅（并发请求只弹一次）
 * @param {string} [message]
 * @param {object} [subscriptionGuide]
 * @param {{ force?: boolean }} [options] force=true 时即使已在套餐页也提示
 */
export const promptSubscribePackage = (message, subscriptionGuide, options = {}) => {
    if (entitlementDialogShowing) return

    const onPlansPage = router.currentRoute.value?.path?.startsWith('/dashboard/plans')
    if (onPlansPage && !options.force) return

    entitlementDialogShowing = true
    const tip =
        subscriptionGuide?.description ||
        subscriptionGuide?.message ||
        message ||
        '您当前没有可用套餐，请先订阅后再使用相关功能'
    const title = subscriptionGuide?.title || '需要订阅套餐'

    if (onPlansPage) {
        ElMessageBox.alert(tip, title, {
            confirmButtonText: '知道了',
            type: 'warning',
            closeOnClickModal: false,
        })
            .catch(() => {})
            .finally(() => {
                entitlementDialogShowing = false
            })
        return
    }

    ElMessageBox.confirm(tip, title, {
        confirmButtonText: '去订阅',
        cancelButtonText: '稍后再说',
        type: 'warning',
        distinguishCancelAndClose: true,
        closeOnClickModal: false,
    })
        .then(() => {
            router.push('/dashboard/plans').catch(() => {})
        })
        .catch(() => {})
        .finally(() => {
            entitlementDialogShowing = false
        })
}

const createNoEntitlementError = (data = {}) => {
    const err = new Error(data.message || '需要订阅套餐')
    err.code = 'NO_ENTITLEMENT'
    err.silent = true
    err.subscriptionGuide = data.subscriptionGuide || null
    return err
}

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
            if (res.code === 'NO_ENTITLEMENT') {
                promptSubscribePackage(res.message, res.subscriptionGuide)
                return Promise.reject(createNoEntitlementError(res))
            }
            const safeMessage = toSafeClientMessage(res.message || '请求失败', response.config?.url)
            ElMessage.error(safeMessage)
            return Promise.reject(new Error(safeMessage))
        }

        return res
    },
    async error => {
        console.error('响应错误:', error)

        const originalRequest = error.config
        const responseData = error.response?.data

        if (responseData?.code === 'NO_ENTITLEMENT') {
            promptSubscribePackage(responseData.message, responseData.subscriptionGuide)
            const err = createNoEntitlementError(responseData)
            err.response = error.response
            return Promise.reject(err)
        }

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
            message =
                error.response.data?.message ||
                ({
                    401: '未授权，请重新登录',
                    403: '拒绝访问',
                    404: '请求错误，未找到该资源',
                    500: '服务器错误',
                }[error.response.status] || `连接错误${error.response.status}`)
        } else if (error.request) {
            message = '网络连接失败'
        }

        const safeMessage = toSafeClientMessage(message, originalRequest?.url)
        ElMessage.error(safeMessage)
        return Promise.reject(error)
    }
)

export default service
