import axios from 'axios'
import { Toast } from './popup.js'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      const errorMsg = res.msg || '请求失败'
      Toast.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    } else {
      return res.data
    }
  },
  (error) => {
    // 处理 HTTP 错误响应
    if (error.response) {
      const res = error.response.data
      const errorMsg = res?.msg || res?.message || error.response.statusText || '请求失败'
      Toast.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    } else if (error.request) {
      // 请求已发出但没有收到响应
      Toast.error('网络错误，请检查网络连接')
      return Promise.reject(new Error('网络错误'))
    } else {
      // 其他错误
      const errorMsg = error.message || '未知错误'
      Toast.error(errorMsg)
      return Promise.reject(error)
    }
  }
)

export default service
