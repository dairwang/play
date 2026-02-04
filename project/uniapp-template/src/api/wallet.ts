import { request } from '@/utils/request'

export interface WalletFlowItem {
  id: number
  type: 'deposit' | 'payment' | 'income' | 'withdraw' | string
  amount: string | number
  related_id?: number | null
  created_at: string
  order_no?: string | null
  other_nickname?: string | null
  other_avatar?: string | null
}

export async function getWalletFlowList() {
  return await request<{ code: number, msg?: string, data: WalletFlowItem[] }>({
    url: '/wallet/flow/list',
    method: 'GET',
  })
}

