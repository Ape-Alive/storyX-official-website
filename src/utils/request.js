import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from './storage'

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        const token = getToken()
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        // 对请求错误做些什么
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        const res = response.data

        // 如果返回的状态码不是200，则认为是错误
        if (res.code !== undefined && res.code !== 200) {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message || '请求失败'))
        }

        return res
    },
    error => {
        // 对响应错误做点什么
        console.error('响应错误:', error)

        let message = '请求失败'

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    message = '未授权，请重新登录'
                    // 可以在这里清除token并跳转到登录页
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
