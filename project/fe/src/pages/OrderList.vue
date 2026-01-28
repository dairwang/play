<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black px-4 py-6">
    <HeaderBar title="我的订单" />
    <div class="text-white font-bold text-lg mb-4 mt-16">订单列表</div>
    
    <!-- Tabs -->
    <div class="flex border-b border-white/10 mb-4">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        @click="currentTab = tab.value"
        class="flex-1 py-3 text-center transition-colors relative"
        :class="currentTab === tab.value ? 'text-primary font-bold' : 'text-gray-400'"
      >
        {{ tab.label }}
        <div v-if="currentTab === tab.value" class="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">加载中...</div>
    <div v-else-if="list.length === 0" class="text-center text-gray-500 py-10">暂无订单</div>

    <div v-else class="space-y-4">
      <div v-for="item in list" :key="item.id" class="card p-4">
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
          <span class="text-xs text-gray-500">订单号: {{ item.order_no }}</span>
          <span class="text-xs font-bold" :class="getStatusColor(item.status)">{{ getStatusText(item.status) }}</span>
        </div>

        <div class="flex items-start gap-3 mb-3">
          <SmartImage 
            :src="currentTab === 'client' ? item.Companion?.avatar : item.Client?.avatar" 
            cls="w-12 h-12 rounded-full object-cover bg-gray-700" 
          />
          <div class="flex-1">
            <div class="flex justify-between">
              <span class="text-white font-bold">{{ currentTab === 'client' ? item.Companion?.nickname : item.Client?.nickname }}</span>
              <span class="text-primary font-bold">¥{{ item.amount }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-1">游戏: {{ item.Game?.name }}</div>
            <div v-if="item.remark" class="text-xs text-gray-500 mt-2 bg-white/5 p-2 rounded">
              备注: {{ item.remark }}
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t border-white/5 gap-2">
          <!-- Client Actions -->
          <template v-if="currentTab === 'client'">
            <button v-if="item.status === 'pending'" @click="cancelOrder(item)" class="btn-outline text-xs px-3 py-1">取消订单</button>
            <button v-if="item.status === 'accepted'" @click="completeOrder(item)" class="btn-primary text-xs px-3 py-1">完成订单</button>
            <button v-if="item.status === 'completed'" @click="applyRefund(item)" class="btn-outline text-xs px-3 py-1">申请退款</button>
          </template>

          <!-- Companion Actions -->
          <template v-else>
            <button v-if="item.status === 'pending'" @click="acceptOrder(item)" class="btn-primary text-xs px-3 py-1">接单</button>
            <button v-if="item.status === 'pending'" @click="cancelOrder(item)" class="btn-outline text-xs px-3 py-1">拒绝</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import HeaderBar from '../components/HeaderBar.vue'
import SmartImage from '../components/SmartImage.vue'
import request from '../common/request'
import { Toast, Confirm } from '../common/popup.js'

const tabs = [
  { label: '我点的单', value: 'client' },
  { label: '我接的单', value: 'companion' }
]

const currentTab = ref('client')
const list = ref([])
const loading = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request({ 
      url: `/orders/my?role=${currentTab.value}` 
    })
    list.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(currentTab, () => {
  fetchList()
})

onMounted(() => {
  const type = new URLSearchParams(window.location.search).get('type')
  if (type === 'companion') currentTab.value = 'companion'
  fetchList()
})

const getStatusText = (status) => {
  const map = { pending: '待接单', accepted: '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const getStatusColor = (status) => {
  const map = { pending: 'text-yellow-500', accepted: 'text-green-500', completed: 'text-gray-400', cancelled: 'text-gray-500' }
  return map[status]
}

// Actions
const cancelOrder = async (item) => {
  try {
    await Confirm('确定取消该订单吗？')
    await request({ url: `/orders/cancel/${item.id}`, method: 'POST' })
    fetchList()
    Toast.success('订单已取消')
  } catch (e) { 
    if (e !== false) Toast.error(e.msg || '操作失败') 
  }
}

const acceptOrder = async (item) => {
  try {
    await request({ url: `/orders/accept/${item.id}`, method: 'POST' })
    Toast.success('接单成功')
    fetchList()
  } catch (e) { Toast.error(e.msg || '操作失败') }
}

const completeOrder = async (item) => {
  try {
    await Confirm('确定订单已完成并支付吗？')
    await request({ url: `/orders/complete/${item.id}`, method: 'POST' })
    Toast.success('订单完成，支付成功')
    fetchList()
  } catch (e) { 
    if (e !== false) Toast.error(e.msg || '操作失败')
  }
}

const applyRefund = async (item) => {
  try {
    await Confirm('确定对该订单发起退款申请吗？')
    await request({
      url: '/refunds/apply',
      method: 'POST',
      data: {
        order_id: item.id,
        reason: '用户发起退款申请'
      }
    })
    Toast.success('退款申请已提交')
  } catch (e) {
    if (e !== false) Toast.error(e.msg || '操作失败')
  }
}
</script>
