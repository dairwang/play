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
  rating?: number | null
  review?: string | null
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
const showEvaluateModal = ref(false)
const evaluateOrderItem = ref<OrderItem | null>(null)
const evaluateRating = ref(5)
const evaluateReview = ref('')
const evaluateSubmitting = ref(false)

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

/** 已完成且未评价：无 rating 或 rating 为 null/undefined 时显示评价入口 */
function canEvaluate(item: OrderItem) {
  if (item.status !== 'completed') return false
  const r = item.rating
  return r === null || r === undefined || r === ''
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

function openEvaluateModal(item: OrderItem) {
  evaluateOrderItem.value = item
  evaluateRating.value = 5
  evaluateReview.value = ''
  showEvaluateModal.value = true
}

function closeEvaluateModal() {
  showEvaluateModal.value = false
  evaluateOrderItem.value = null
}

async function submitEvaluate() {
  const item = evaluateOrderItem.value
  if (!item) return
  evaluateSubmitting.value = true
  try {
    await request({
      url: `/orders/evaluate/${item.id}`,
      method: 'POST',
      data: {
        rating: evaluateRating.value,
        review: evaluateReview.value || undefined,
      },
    })
    toastSuccess('评价成功')
    closeEvaluateModal()
    await fetchList()
  }
  catch (e: any) {
    toastError(e?.msg || '评价失败')
  }
  finally {
    evaluateSubmitting.value = false
  }
}
</script>

<template>
  <view class="page-container min-h-screen px-4 py-6">
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

        <view class="flex justify-end pt-2 border-t border-white/5 gap-2 flex-wrap">
          <!-- Client Actions：评价入口优先展示 -->
          <template v-if="currentTab === 'client'">
            <button
              v-if="canEvaluate(item)"
              class="btn-primary text-xs px-3 py-1"
              @click="openEvaluateModal(item)"
            >
              评价
            </button>
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

    <!-- 评价弹出层：使用 u-popup，用法参考 uni-popup -->
    <u-popup
      v-model:show="showEvaluateModal"
      mode="bottom"
      :round="20"
      :close-on-click-overlay="true"
      :closeable="true"
      bg-color="#16213E"
      @close="closeEvaluateModal"
    >
      <view class="p-6 pb-10">
        <view class="flex justify-between items-center mb-4">
          <text class="text-lg font-bold text-white">
            订单评价
          </text>
        </view>
        <view class="mb-4">
          <text class="text-gray-400 text-sm block mb-2">评分</text>
          <u-rate v-model="evaluateRating" :count="5" size="20" active-color="#FF2D55" />
        </view>
        <view class="mb-6">
          <text class="text-gray-400 text-sm block mb-2">评价内容（选填）</text>
          <textarea
            v-model="evaluateReview"
            class="w-full bg-black/20 text-white rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary resize-none placeholder-gray-600 text-sm min-h-[80px]"
            placeholder="说说你的体验吧..."
          />
        </view>
        <button
          class="w-full btn-primary py-3 flex items-center justify-center"
          :disabled="evaluateSubmitting"
          @click="submitEvaluate"
        >
          {{ evaluateSubmitting ? '提交中...' : '确认提交' }}
        </button>
      </view>
    </u-popup>
  </view>
</template>

<style scoped>
.page-container {
  background: linear-gradient(180deg, #1C0F3C 0%, #221245 50%, #1a0d35 100%);
  position: relative;
  min-height: 100vh;
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.15), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(168, 85, 247, 0.2), transparent),
    radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(1px 1px at 80% 10%, rgba(168, 85, 247, 0.15), transparent),
    radial-gradient(2px 2px at 40% 80%, rgba(255, 255, 255, 0.1), transparent);
  background-size: 200% 200%;
  background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%, 100% 0%;
  pointer-events: none;
  z-index: 0;
}

.page-container > view {
  position: relative;
  z-index: 1;
}
</style>
