<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black pb-20">
    <div class="pt-14 px-6 pb-8 bg-gradient-to-b from-transparent to-transparent">
      <div class="flex items-center">
        <div class="relative">
          <SmartImage :src="user.avatar" :fallback="fallbacks.avatar" cls="w-20 h-20 rounded-full border-2 border-primary shadow-xl object-cover" />
          <div v-if="user.is_companion" class="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full border border-dark">陪玩师</div>
        </div>
        <div class="ml-4 flex-1">
          <div class="text-xl font-bold text-white mb-1">{{ user.nickname || '未登录' }}</div>
          <div class="text-gray-400 text-sm">ID: {{ user.id || '--' }}</div>
        </div>
        <!-- 点击进入编辑资料页面 -->
        <div class="text-gray-400">›</div>
      </div>

      <div class="flex justify-around mt-8">
        <div class="text-center">
          <div class="text-lg font-bold text-white">{{ user.balance || '0.00' }}</div>
          <div class="text-xs text-gray-500 mt-1">余额</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-white">0</div>
          <div class="text-xs text-gray-500 mt-1">关注</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-white">0</div>
          <div class="text-xs text-gray-500 mt-1">粉丝</div>
        </div>
      </div>
    </div>

    <div class="px-4 mt-4">
      <!-- Service Management Section -->
      <div v-if="user.is_companion" class="card p-4 mb-4">
        <div class="font-bold text-white mb-3">我的服务</div>
        <div v-if="services.length === 0" class="text-gray-500 text-sm text-center py-2">暂无服务</div>
        <div v-for="service in services" :key="service.id" class="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
          <div>
            <div class="text-white text-sm font-bold">{{ service.Game?.name }}</div>
            <div class="text-xs mt-1" :class="getStatusColor(service.audit_status)">
              审核状态: {{ getAuditStatusText(service.audit_status) }}
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-xs mr-2" :class="service.status ? 'text-green-400' : 'text-gray-500'">
              {{ service.status ? '接单中' : '休息中' }}
            </span>
            <!-- Toggle Switch -->
            <button 
              @click="toggleStatus(service)"
              class="w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none"
              :class="service.status ? 'bg-primary' : 'bg-gray-600'"
              :disabled="service.audit_status !== 'approved'"
            >
              <div 
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300"
                :class="service.status ? 'translate-x-5' : 'translate-x-0'"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <div class="card p-4 mb-4 cursor-pointer hover:shadow-2xl transition-shadow" @click="goOrderList('all')">
        <div class="flex justify-between items-center mb-4">
          <span class="font-bold text-white">我的订单</span>
          <span class="text-xs text-gray-500">查看全部 ></span>
        </div>
        <div class="flex justify-around">
          <div class="flex flex-col items-center">
            <span class="mb-1 text-primary">💳</span>
            <span class="text-xs text-gray-400">待付款</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="mb-1 text-primary">📅</span>
            <span class="text-xs text-gray-400">进行中</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="mb-1 text-primary">💬</span>
            <span class="text-xs text-gray-400">待评价</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="mb-1 text-primary">ℹ️</span>
            <span class="text-xs text-gray-400">退款/售后</span>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/5 cursor-pointer" @click="handleApplyCompanion">
          <div class="flex items-center">
            <span class="mr-3">⭐</span>
            <span class="text-white text-sm">申请成为陪玩</span>
          </div>
          <span class="text-gray-500">›</span>
        </div>

        <div class="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/5">
          <div class="flex items-center">
            <span class="mr-3">👛</span>
            <span class="text-white text-sm">我的钱包</span>
          </div>
          <span class="text-gray-500">›</span>
        </div>

        <div class="flex items-center justify-between p-4 active:bg-white/5 cursor-pointer" @click="handleLogout">
          <div class="flex items-center">
            <span class="mr-3">⚙️</span>
            <span class="text-white text-sm">退出登录</span>
          </div>
          <span class="text-gray-500">›</span>
        </div>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '../components/TabBar.vue'
import SmartImage from '../components/SmartImage.vue'
import { DEFAULT_AVATAR } from '../common/images.js'
import request from '../common/request'
import { Toast } from '../common/popup.js'

const router = useRouter()
const user = ref({})
const services = ref([])
const fallbacks = { avatar: DEFAULT_AVATAR }

onMounted(() => {
   const userData = localStorage.getItem('user')
   if (userData) {
     user.value = JSON.parse(userData)
   }
   fetchProfile()
 })
 
 const fetchProfile = async () => {
   try {
     const res = await request({ url: '/auth/profile' })
     user.value = res.data
     // Update localStorage to keep it fresh
     localStorage.setItem('user', JSON.stringify(res.data))
     
     if (user.value.is_companion) {
       fetchMyServices()
     }
   } catch (error) {
     console.error('Failed to fetch profile:', error)
   }
 }

 const fetchMyServices = async () => {
  try {
    const res = await request({ url: '/companions/my' })
    services.value = res.data
  } catch (error) {
    console.error('Failed to fetch services:', error)
  }
}

const toggleStatus = async (service) => {
  if (service.audit_status !== 'approved') {
    return Toast.error('服务未审核通过，无法开启接单')
  }
  try {
    const res = await request({ 
      url: `/companions/toggle/${service.id}`,
      method: 'POST'
    })
    service.status = res.data.status
    Toast.success(service.status ? '已开启接单' : '已停止接单')
  } catch (error) {
    Toast.error(error.msg || '操作失败')
  }
}

const getAuditStatusText = (status) => {
  const map = { pending: '审核中', approved: '已通过', rejected: '已驳回' }
  return map[status] || status
}

const getStatusColor = (status) => {
  const map = { pending: 'text-yellow-500', approved: 'text-green-500', rejected: 'text-red-500' }
  return map[status] || 'text-gray-500'
}

const goOrderList = (type) => {
  router.push(`/order/list?type=${type}`)
}

const handleApplyCompanion = () => {
  router.push('/apply')
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script> 
