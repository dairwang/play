<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { request } from '@/utils/request'

interface GameItem {
  id: string | number
  name: string
}

const games = ref<GameItem[]>([])
const submitting = ref(false)

const form = reactive({
  game_id: '',
  price: '',
  description: '',
})

const selectedGameIndex = ref<number | null>(null)

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

async function fetchGames() {
  try {
    const res: any = await request({ url: '/games/list' })
    games.value = res.data || []
  }
  catch (error) {
    console.error('Failed to fetch games:', error)
  }
}

function onGameChange(e: any) {
  const index = Number(e.detail?.value ?? -1)
  if (Number.isNaN(index) || index < 0 || index >= games.value.length)
    return

  selectedGameIndex.value = index
  const game = games.value[index]
  form.game_id = String(game.id)
}

async function submit() {
  if (!form.game_id) {
    toastError('请选择游戏')
    return
  }
  if (!form.price) {
    toastError('请输入价格')
    return
  }
  if (!form.description) {
    toastError('请输入自我介绍')
    return
  }

  submitting.value = true
  try {
    await request({
      url: '/companions/apply',
      method: 'POST',
      data: {
        game_id: form.game_id,
        price: Number(form.price),
        description: form.description,
      },
    })

    toastSuccess('申请提交成功，请等待审核')
    // 对应原项目 router.push('/user')
    uni.switchTab({
      url: '/pages/my/my',
    })
  }
  catch (error: any) {
    toastError(error?.msg || '提交失败')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchGames()
})
</script>

<template>
  <view class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black px-4 py-6">
    <HNavBar title="申请陪玩" :placeholder="true" />
    <view class="text-white font-bold text-lg mb-4 mt-16">
      申请成为陪玩
    </view>

    <view class="card p-4 bg-[#16213E] rounded-xl border border-white/5">
      <view class="mb-6 text-gray-400 text-sm">
        填写下方信息提交审核，审核通过后即可接单
      </view>

      <!-- Game Selection -->
      <view class="mb-4">
        <view class="block text-gray-400 text-xs mb-2">
          选择游戏
        </view>
        <view class="relative">
          <picker
            mode="selector"
            :range="games"
            range-key="name"
            @change="onGameChange"
          >
            <view class="w-full bg-[#0f3460] text-white rounded-lg px-4 py-3 flex items-center justify-between">
              <text>
                {{ selectedGameIndex !== null ? games[selectedGameIndex]?.name : '请选择擅长的游戏' }}
              </text>
              <view class="text-gray-400">
                ▼
              </view>
            </view>
          </picker>
        </view>
      </view>

      <!-- Price Input -->
      <view class="mb-4">
        <view class="block text-gray-400 text-xs mb-2">
          服务价格 (元/局)
        </view>
        <input
          v-model="form.price"
          type="number"
          class="w-full bg-[#0f3460] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
          placeholder="请输入每局价格"
        >
      </view>

      <!-- Description Input -->
      <view class="mb-6">
        <view class="block text-gray-400 text-xs mb-2">
          自我介绍
        </view>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full bg-[#0f3460] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder-gray-500 resize-none"
          placeholder="介绍一下你的技术特点、段位等优势..."
        />
      </view>

      <!-- Submit Button -->
      <button
        class="w-full bg-primary text-white font-bold py-3 rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
        :disabled="submitting"
        @click="submit"
      >
        <view
          v-if="submitting"
          class="mr-2 animate-spin"
        >
          <svg
            class="h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </view>
        {{ submitting ? '提交中...' : '提交审核' }}
      </button>
    </view>
  </view>
</template>

<style scoped>
</style>
