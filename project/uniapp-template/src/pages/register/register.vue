<script setup lang="ts">
import { ref } from 'vue'
import { request } from '@/utils/request'

const form = ref({
  username: '',
  nickname: '',
  password: '',
})

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

function goLogin() {
  // 对应原项目 this.$router.back()
  // 这里优先尝试返回上一页；如无上一页可按需改为跳转登录页
  uni.navigateBack({
    delta: 1,
  })
}

async function handleRegister() {
  if (!form.value.username || !form.value.password || !form.value.nickname) {
    toastError('请填写完整信息')
    return
  }

  loading.value = true
  try {
    await request({
      url: '/auth/register',
      method: 'POST',
      data: form.value,
    })
    toastSuccess('注册成功')
    goLogin()
  }
  catch (e: any) {
    console.error(e)
    toastError(e?.msg || '注册失败')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black grid place-items-center px-6">
    <HNavBar title="注册" :placeholder="true" />

    <view class="glass w-full max-w-md p-8 rounded-3xl mt-16">
      <view class="text-center mb-8">
        <view class="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-pink-500 grid place-items-center animate-[pulse-glow_3s_ease_infinite]">
          ➕
        </view>
        <view class="mt-4 hero-title">
          创建账号
        </view>
        <view class="mt-1 text-gray-400 text-sm">
          加入我们，开启电竞社交
        </view>
      </view>

      <view class="mb-4">
        <view class="input">
          <text class="mr-3 text-gray-400">
            👤
          </text>
          <input
            v-model="form.username"
            type="text"
            placeholder="用户名"
            class="input-field"
          >
        </view>
      </view>

      <view class="mb-4">
        <view class="input">
          <text class="mr-3 text-gray-400">
            💖
          </text>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="昵称"
            class="input-field"
          >
        </view>
      </view>

      <view class="mb-6">
        <view class="input">
          <text class="mr-3 text-gray-400">
            🔒
          </text>
          <input
            v-model="form.password"
            type="password"
            placeholder="密码"
            class="input-field"
          >
        </view>
      </view>

      <button
        class="btn-primary w-full"
        :disabled="loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注 册' }}
      </button>

      <view class="mt-6 flex items-center justify-center text-sm">
        <text class="text-gray-500">
          已有账号？
        </text>
        <text
          class="text-primary ml-2 font-bold"
          @click="goLogin"
        >
          立即登录
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
</style>
