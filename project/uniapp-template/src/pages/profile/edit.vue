<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { request } from '@/utils/request'

const loading = ref(false)
const isCompanion = ref(false)
const serviceId = ref<number | null>(null)

const form = reactive({
  avatar: '',
  nickname: '',
  signature: '',
  contact: '',
  price: '',
})

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

async function fetchData() {
  try {
    loading.value = true
    const profileRes: any = await request({ url: '/auth/profile' })
    const user = profileRes.data || {}

    form.avatar = user.avatar || ''
    form.nickname = user.nickname || ''
    form.signature = user.signature || ''
    form.contact = user.contact || ''
    isCompanion.value = !!user.is_companion

    if (isCompanion.value) {
      const myRes: any = await request({ url: '/companions/my' })
      const services = myRes.data || []
      const first = services[0]
      if (first) {
        serviceId.value = first.id
        form.price = String(first.price ?? '')
      }
    }
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!form.nickname) {
    toastError('请输入昵称')
    return
  }
  if (isCompanion.value && !form.price) {
    toastError('请输入服务价格')
    return
  }

  loading.value = true
  try {
    // 更新用户基本信息（头像 / 昵称 / 签名）
    const profileRes: any = await request({ url: '/auth/profile' })
    const user = profileRes.data || {}

    await request({
      url: `/users/update/${user.id}`,
      method: 'PUT',
      data: {
        avatar: form.avatar,
        nickname: form.nickname,
        signature: form.signature,
        contact: form.contact,
      },
    })

    // 若是陪玩，更新服务价格
    if (isCompanion.value && serviceId.value !== null) {
      await request({
        url: `/companions/update/${serviceId.value}`,
        method: 'PUT',
        data: {
          price: Number(form.price),
        },
      })
    }

    // 刷新本地 user 信息
    const latest: any = await request({ url: '/auth/profile' })
    uni.setStorageSync('user', latest.data)

    toastSuccess('资料已保存')
    uni.navigateBack()
  }
  catch (error: any) {
    console.error(error)
    toastError(error?.msg || '保存失败')
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <view class="page-container min-h-screen px-4 py-6">
    <HNavBar title="编辑资料" :placeholder="true" />

    <view class="flex items-center flex-col">
      <!-- 头像预览 -->
      <view class="">
        <image
          :src="`https://images.weserv.nl/?url=${form.avatar}`"
          class="w-60px h-60px rounded-full border-2 border-primary object-cover bg-gray-700"
          mode="aspectFill"
        />
      </view>

      <!-- 基本信息 -->
      <view class="card p-4">
        <view class="text-white font-bold mb-3">
          基本信息
        </view>

        <view class="mb-3">
          <view class="text-xs text-gray-400 mb-1">
            头像地址 URL
          </view>
          <input
            v-model="form.avatar"
            class=" bg-[#0f3460] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
            placeholder="请输入头像图片的网络地址"
          >
        </view>

        <view class="mb-3">
          <view class="text-xs text-gray-400 mb-1">
            昵称
          </view>
          <input
            v-model="form.nickname"
            class=" bg-[#0f3460] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
            placeholder="请输入昵称"
          >
        </view>

        <view class="mb-1">
          <view class="text-xs text-gray-400 mb-1">
            个性签名
          </view>
          <textarea
            v-model="form.signature"
            rows="3"
            class=" bg-[#0f3460] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary placeholder-gray-500 resize-none"
            placeholder="写一句话介绍自己吧～"
          />
        </view>

        <view class="mb-1">
          <view class="text-xs text-gray-400 mb-1">
            联系方式（微信 / QQ / 手机）
          </view>
          <input
            v-model="form.contact"
            class=" bg-[#0f3460] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
            placeholder="请输入联系方式，方便玩家联系你"
          >
        </view>
      </view>

      <!-- 陪玩服务设置 -->
      <view
        v-if="isCompanion"
        class="card p-4"
      >
        <view class="text-white font-bold mb-3">
          陪玩服务
        </view>
        <!-- <view class="mb-3 text-xs text-gray-400">
          当前仅支持修改第一项陪玩服务的价格，更多配置可在后台管理中完善。
        </view> -->

        <view class="mb-1">
          <view class="text-xs text-gray-400 mb-1">
            服务价格（元 / 小时）
          </view>
          <input
            v-model="form.price"
            type="number"
            class="w-full bg-[#0f3460] text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
            placeholder="请输入服务价格"
          >
        </view>
      </view>

      <!-- 保存按钮 -->
      <button
        class="btn-primary w-full mt-4 py-3 rounded-lg font-bold flex items-center justify-center"
        :disabled="loading"
        @click="handleSave"
      >
        <text v-if="loading" class="mr-2 animate-spin">
          ⏳
        </text>
        {{ loading ? '保存中...' : '保存' }}
      </button>
    </view>
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
