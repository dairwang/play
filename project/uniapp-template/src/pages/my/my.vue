<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { DEFAULT_AVATAR } from '@/common/images'
import SmartImage from '@/components/SmartImage.vue'
import HTabBar from '@/components/hexui/HTabBar.vue'
import { request } from '@/utils/request'

const user = ref<any>({})
const services = ref<any[]>([])

const fallbacks = {
  avatar: DEFAULT_AVATAR,
}

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

// 每次显示页面时重新拉取数据（含切换 tabBar 回到我的）
onShow(() => {
  const userData = uni.getStorageSync('user')
  if (userData)
    user.value = typeof userData === 'string' ? JSON.parse(userData) : userData
  fetchProfile()
})

async function fetchProfile() {
  try {
    const res: any = await request({ url: '/auth/profile' })
    user.value = res.data
    // Update storage to keep it fresh
    uni.setStorageSync('user', res.data)

    if (user.value.is_companion)
      fetchMyServices()
  }
  catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

async function fetchMyServices() {
  try {
    const res: any = await request({ url: '/companions/my' })
    services.value = res.data
  }
  catch (error) {
    console.error('Failed to fetch services:', error)
  }
}

async function toggleStatus(service: any) {
  if (service.audit_status !== 'approved')
    return toastError('服务未审核通过，无法开启接单')
  try {
    const res: any = await request({
      url: `/companions/toggle/${service.id}`,
      method: 'POST',
    })
    service.status = res.data.status
    toastSuccess(service.status ? '已开启接单' : '已停止接单')
  }
  catch (error: any) {
    toastError(error?.msg || '操作失败')
  }
}

function getAuditStatusText(status: string) {
  const map: Record<string, string> = { pending: '审核中', approved: '已通过', rejected: '已驳回' }
  return map[status] || status
}

function getStatusColor(status: string) {
  const map: Record<string, string> = { pending: 'text-yellow-500', approved: 'text-green-500', rejected: 'text-red-500' }
  return map[status] || 'text-gray-500'
}

function goOrderList(type: string) {
  uni.navigateTo({
    url: `/pages/order/list?type=${type}`,
  })
}

function goEditProfile() {
  uni.navigateTo({
    url: '/pages/profile/edit',
  })
}

function handleApplyCompanion() {
  uni.navigateTo({
    url: '/pages/apply/apply',
  })
}

function handleLogout() {
  uni.removeStorageSync('token')
  uni.removeStorageSync('user')
  uni.reLaunch({
    url: '/pages/login/login',
  })
}
</script>

<template>
  <view class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black pb-20">
    <view class="pt-14 px-6 pb-8 bg-gradient-to-b from-transparent to-transparent">
      <view class="flex items-center">
        <view class="relative">
          <SmartImage
            :src="user.avatar"
            :fallback="fallbacks.avatar"
            cls="w-20 h-20 rounded-full border-2 border-primary shadow-xl object-cover"
          />
          <view
            v-if="user.is_companion"
            class="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full border border-dark"
          >
            陪玩师
          </view>
        </view>
        <view class="ml-4 flex-1">
          <view class="text-xl font-bold text-white mb-1">
            {{ user.nickname || '未登录' }}
          </view>
          <view class="text-gray-400 text-sm">
            ID: {{ user.id || '--' }}
          </view>
        </view>
        <!-- 点击进入编辑资料页面 -->
        <view
          class="text-gray-400"
          @tap="goEditProfile"
        >
          ›
        </view>
      </view>

      <view class="flex justify-around mt-8">
        <view class="text-center">
          <view class="text-lg font-bold text-white">
            {{ user.balance || '0.00' }}
          </view>
          <view class="text-xs text-gray-500 mt-1">
            余额
          </view>
        </view>
        <view class="text-center">
          <view class="text-lg font-bold text-white">
            {{ user.following_count ?? 0 }}
          </view>
          <view class="text-xs text-gray-500 mt-1">
            关注
          </view>
        </view>
        <view class="text-center">
          <view class="text-lg font-bold text-white">
            {{ user.fans_count ?? 0 }}
          </view>
          <view class="text-xs text-gray-500 mt-1">
            粉丝
          </view>
        </view>
      </view>
    </view>

    <view class="px-4 mt-4">
      <!-- Service Management Section -->
      <view
        v-if="user.is_companion"
        class="card p-4 mb-4"
      >
        <view class="font-bold text-white mb-3">
          我的服务
        </view>
        <view
          v-if="services.length === 0"
          class="text-gray-500 text-sm text-center py-2"
        >
          暂无服务
        </view>
        <view
          v-for="service in services"
          :key="service.id"
          class="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
        >
          <view>
            <view class="text-white text-sm font-bold">
              {{ service.Game?.name }}
            </view>
            <view
              class="text-xs mt-1"
              :class="getStatusColor(service.audit_status)"
            >
              审核状态: {{ getAuditStatusText(service.audit_status) }}
            </view>
          </view>
          <view class="flex items-center">
            <text
              class="text-xs mr-2"
              :class="service.status ? 'text-green-400' : 'text-gray-500'"
            >
              {{ service.status ? '接单中' : '休息中' }}
            </text>
            <!-- Toggle Switch -->
            <button
              class="w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none"
              :class="service.status ? 'bg-primary' : 'bg-gray-600'"
              :disabled="service.audit_status !== 'approved'"
              @tap="toggleStatus(service)"
            >
              <view
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300"
                :class="service.status ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </view>
        </view>
      </view>

      <view
        class="card p-4 mb-4 cursor-pointer hover:shadow-2xl transition-shadow"
        @tap="goOrderList('all')"
      >
        <view class="flex justify-between items-center mb-4">
          <text class="font-bold text-white">
            我的订单
          </text>
          <text class="text-xs text-gray-500">
            查看全部 >
          </text>
        </view>
        <view class="flex justify-around">
          <view class="flex flex-col items-center">
            <text class="mb-1 text-primary">
              💳
            </text>
            <text class="text-xs text-gray-400">
              待付款
            </text>
          </view>
          <view class="flex flex-col items-center">
            <text class="mb-1 text-primary">
              📅
            </text>
            <text class="text-xs text-gray-400">
              进行中
            </text>
          </view>
          <view class="flex flex-col items-center">
            <text class="mb-1 text-primary">
              💬
            </text>
            <text class="text-xs text-gray-400">
              待评价
            </text>
          </view>
          <view class="flex flex-col items-center">
            <text class="mb-1 text-primary">
              ℹ️
            </text>
            <text class="text-xs text-gray-400">
              退款/售后
            </text>
          </view>
        </view>
      </view>

      <view class="card overflow-hidden">
        <view
          class="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/5 cursor-pointer"
          @tap="handleApplyCompanion"
        >
          <view class="flex items-center">
            <text class="mr-3">
              ⭐
            </text>
            <text class="text-white text-sm">
              申请成为陪玩
            </text>
          </view>
          <text class="text-gray-500">
            ›
          </text>
        </view>

        <view class="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/5">
          <view class="flex items-center">
            <text class="mr-3">
              👛
            </text>
            <text class="text-white text-sm">
              我的钱包
            </text>
          </view>
          <text class="text-gray-500">
            ›
          </text>
        </view>

        <view
          class="flex items-center justify-between p-4 active:bg-white/5 cursor-pointer"
          @tap="handleLogout"
        >
          <view class="flex items-center">
            <text class="mr-3">
              ⚙️
            </text>
            <text class="text-white text-sm">
              退出登录
            </text>
          </view>
          <text class="text-gray-500">
            ›
          </text>
        </view>
      </view>
    </view>

    <HTabBar value="pages/my/my" />
  </view>
</template>

<style lang="scss" scoped>
</style>
