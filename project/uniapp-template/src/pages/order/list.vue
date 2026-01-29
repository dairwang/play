<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SmartImage from '@/components/SmartImage.vue'
import { request } from '@/utils/request'

interface OrderItem {
  id: number | string
  order_no: string
  status: string
  amount: number
  remark?: string
  Game?: {
    name?: string
  }
  Companion?: {
    avatar?: string
    nickname?: string
  }
  Client?: {
    avatar?: string
    nickname?: string
  }
}

const tabs = [
  { label: '我点的单', value: 'client' },
  { label: '我接的单', value: 'companion' },
] as const

type TabValue = (typeof tabs)[number]['value']

const currentTab = ref<TabValue>('client')
const list = ref<OrderItem[]>([])
const loading = ref(false)

function toastSuccess(msg: string) {
  uni.showToast({
    title: msg,
    icon: 'success',
  })
}

function toastError(msg: string) {
  uni.showToast({
    title: msg,
    icon: 'none',
  })
}

function showConfirm(message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '提示',
      content: message,
      success(res) {
        if (res.confirm)
          resolve()
        else
          reject(new Error('cancelled'))
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await request({
      url: `/orders/my?role=${currentTab.value}`,
    })
    list.value = res.data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

watch(currentTab, () => {
  fetchList()
})

onLoad((options) => {
  const type = options?.type
  if (type === 'companion')
    currentTab.value = 'companion'

  fetchList()
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待接单',
    accepted: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'text-yellow-500',
    accepted: 'text-green-500',
    completed: 'text-gray-400',
    cancelled: 'text-gray-500',
  }
  return map[status] || ''
}

async function cancelOrder(item: OrderItem) {
  try {
    await showConfirm('确定取消该订单吗？')
    await request({ url: `/orders/cancel/${item.id}`, method: 'POST' })
    await fetchList()
    toastSuccess('订单已取消')
  }
  catch (e: any) {
    if (e !== false)
      toastError(e?.msg || '操作失败')
  }
}

async function acceptOrder(item: OrderItem) {
  try {
    await request({ url: `/orders/accept/${item.id}`, method: 'POST' })
    toastSuccess('接单成功')
    await fetchList()
  }
  catch (e: any) {
    toastError(e?.msg || '操作失败')
  }
}

async function completeOrder(item: OrderItem) {
  try {
    await showConfirm('确定订单已完成并支付吗？')
    await request({ url: `/orders/complete/${item.id}`, method: 'POST' })
    toastSuccess('订单完成，支付成功')
    await fetchList()
  }
  catch (e: any) {
    if (e !== false)
      toastError(e?.msg || '操作失败')
  }
}

async function applyRefund(item: OrderItem) {
  try {
    await showConfirm('确定对该订单发起退款申请吗？')
    await request({
      url: '/refunds/apply',
      method: 'POST',
      data: {
        order_id: item.id,
        reason: '用户发起退款申请',
      },
    })
    toastSuccess('退款申请已提交')
  }
  catch (e: any) {
    if (e !== false)
      toastError(e?.msg || '操作失败')
  }
}
</script>

<template>
  <view class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black px-4 py-6">
    <HNavBar title="我的订单" :placeholder="true" />
    <view class="text-white font-bold text-lg mb-4 mt-16">
      订单列表
    </view>

    <!-- Tabs -->
    <view class="flex border-b border-white/10 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="flex-1 py-3 text-center transition-colors relative"
        :class="currentTab === tab.value ? 'text-primary font-bold' : 'text-gray-400'"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
        <view
          v-if="currentTab === tab.value"
          class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
        />
      </button>
    </view>

    <view
      v-if="loading"
      class="text-center text-gray-500 py-10"
    >
      加载中...
    </view>
    <view
      v-else-if="list.length === 0"
      class="text-center text-gray-500 py-10"
    >
      暂无订单
    </view>

    <view
      v-else
      class="space-y-4"
    >
      <view
        v-for="item in list"
        :key="item.id"
        class="card p-4"
      >
        <view class="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
          <text class="text-xs text-gray-500">
            订单号: {{ item.order_no }}
          </text>
          <text
            class="text-xs font-bold"
            :class="getStatusColor(item.status)"
          >
            {{ getStatusText(item.status) }}
          </text>
        </view>

        <view class="flex items-start gap-3 mb-3">
          <SmartImage
            :src="currentTab === 'client' ? item.Companion?.avatar : item.Client?.avatar"
            cls="w-12 h-12 rounded-full object-cover bg-gray-700"
          />
          <view class="flex-1">
            <view class="flex justify-between">
              <text class="text-white font-bold">
                {{ currentTab === 'client' ? item.Companion?.nickname : item.Client?.nickname }}
              </text>
              <text class="text-primary font-bold">
                ¥{{ item.amount }}
              </text>
            </view>
            <text class="text-xs text-gray-400 mt-1">
              游戏: {{ item.Game?.name }}
            </text>
            <view
              v-if="item.remark"
              class="text-xs text-gray-500 mt-2 bg-white/5 p-2 rounded"
            >
              备注: {{ item.remark }}
            </view>
          </view>
        </view>

        <view class="flex justify-end pt-2 border-t border-white/5 gap-2">
          <!-- Client Actions -->
          <template v-if="currentTab === 'client'">
            <button
              v-if="item.status === 'pending'"
              class="btn-outline text-xs px-3 py-1"
              @click="cancelOrder(item)"
            >
              取消订单
            </button>
            <button
              v-if="item.status === 'accepted'"
              class="btn-primary text-xs px-3 py-1"
              @click="completeOrder(item)"
            >
              完成订单
            </button>
            <button
              v-if="item.status === 'completed'"
              class="btn-outline text-xs px-3 py-1"
              @click="applyRefund(item)"
            >
              申请退款
            </button>
          </template>

          <!-- Companion Actions -->
          <template v-else>
            <button
              v-if="item.status === 'pending'"
              class="btn-primary text-xs px-3 py-1"
              @click="acceptOrder(item)"
            >
              接单
            </button>
            <button
              v-if="item.status === 'pending'"
              class="btn-outline text-xs px-3 py-1"
              @click="cancelOrder(item)"
            >
              拒绝
            </button>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
</style>
