import { request } from '@/utils/request'

export function getOpenID(data: { code: string }): Promise<any> {
  return request({
    method: 'POST',
    data,
    url: '/user/wxMiniProgram/sessionInfo',
  })
}
