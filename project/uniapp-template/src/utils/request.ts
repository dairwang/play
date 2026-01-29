const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
  data?: any
  header?: Record<string, string>
}

/**
 * 通用请求封装（从 fe/src/common/request.js 迁移而来，适配 uni-app）
 * - 使用 uni.request，兼容多端
 * - 从 uni 存储中读取 token
 * - 默认认为后端返回结构为 { code, msg, data }
 */
export async function request<T = any>(options: RequestOptions): Promise<T> {
  const url = (BASE_URL as string).replace(/\/$/, '') + options.url
  const method = options.method || 'GET'
  const data = options.data || {}
  const token = uni.getStorageSync('token') || ''

  const header = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.header || {}),
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header,
      success(res) {
        const json: any = res.data || {}
        const code = json.code ?? (res.statusCode === 200 ? 200 : res.statusCode)

        if (code === 200) {
          resolve(json as T)
        } else {
          const msg = json.msg || '请求失败'
          console.error(msg, json)
          uni.showToast({
            title: msg,
            icon: 'none',
          })
          reject(json)
        }
      },
      fail(err) {
        console.error('网络错误', err)
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}

export default request
