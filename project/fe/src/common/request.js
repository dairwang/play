const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(options) {
  const url = BASE_URL.replace(/\/$/, '') + options.url
  const method = options.method || 'GET'
  const data = options.data || {}
  const token = localStorage.getItem('token') || ''

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.header || {})
  }

  const res = await fetch(url, {
    method,
    headers,
    body: method === 'GET' ? undefined : JSON.stringify(data)
  })

  const json = await res.json().catch(() => ({ code: res.ok ? 200 : res.status, msg: 'Invalid JSON', data: null }))

  if (json.code === 200) {
    return json
  } else {
    console.error(json.msg || '请求失败')
    throw json
  }
}

export default request
