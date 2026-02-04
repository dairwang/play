<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import HNavBar from '@/components/hexui/HNavBar.vue'
import SmartImage from '@/components/SmartImage.vue'
import { DEFAULT_AVATAR } from '@/common/images'
import { getWalletFlowList, type WalletFlowItem } from '@/api/wallet'

const list = ref<WalletFlowItem[]>([])
const loading = ref(false)

function isIncome(type: string) {
  return type === 'income' || type === 'deposit'
}

function formatAmount(item: WalletFlowItem) {
  const n = Number(item.amount) || 0
  const sign = isIncome(item.type) ? '+' : '-'
  return `${sign}${n.toFixed(2)}`
}

function formatDate(s: string) {
  if (!s) return ''
  // 兼容 iOS：把 "YYYY-MM-DD HH:mm:ss" 转成 "YYYY/MM/DD HH:mm:ss"
  const d = new Date(String(s).replace(/-/g, '/'))
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getWalletFlowList()
    list.value = res.data || []
  }
  finally {
    loading.value = false
  }
}

onShow(() => {
  fetchList()
})
</script>

<template>
  <view class="page-container min-h-screen px-4 py-6">
    <HNavBar title="资金流水" :placeholder="true" />

    <view class="mt-2 text-white font-bold text-lg">
      资金流水
    </view>

    <view v-if="loading" class="mt-6 text-center text-gray-400">
      加载中...
    </view>

    <view v-else-if="list.length === 0" class="mt-6 text-center text-gray-400">
      暂无流水
    </view>

    <view v-else class="mt-4 space-y-3">
      <view
        v-for="item in list"
        :key="item.id"
        class="card p-4 bg-white/5 rounded-2xl border border-white/10"
      >
        <view class="flex items-center">
          <SmartImage
            :src="item.other_avatar || ''"
            :fallback="DEFAULT_AVATAR"
            cls="w-44px h-44px rounded-full object-cover bg-black/20"
          />
          <view class="ml-3 flex-1 min-w-0">
            <view class="flex items-center justify-between">
              <text class="text-white font-bold text-sm truncate">
                {{ item.other_nickname || '系统' }}
              </text>
              <text
                class="font-bold text-sm"
                :class="isIncome(item.type) ? 'text-green-400' : 'text-red-400'"
              >
                {{ formatAmount(item) }}
              </text>
            </view>
            <view class="flex items-center justify-between mt-1">
              <text class="text-xs text-gray-400">
                {{ formatDate(item.created_at) }}
              </text>
              <text class="text-xs text-gray-500">
                {{ item.type }}
              </text>
            </view>
          </view>
        </view>
      </view>
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

