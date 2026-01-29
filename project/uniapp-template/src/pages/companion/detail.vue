<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import SmartImage from '@/components/SmartImage.vue'
import { DEFAULT_AVATAR } from '@/common/images'

const detail = ref<any>({})
const showOrderModal = ref(false)
const remark = ref('')
const submitting = ref(false)

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

onLoad(async (options) => {
  const id = options?.id
  if (!id)
    return

  try {
    const res: any = await request({ url: `/companions/detail?id=${id}` })
    detail.value = res.data
  }
  catch (e) {
    console.error(e)
  }
})

async function submitOrder() {
  // 原逻辑保持：remark 可为空
  if (!detail.value?.User?.id) {
    toastError('陪玩信息缺失')
    return
  }

  submitting.value = true
  try {
    await request({
      url: '/orders/create',
      method: 'POST',
      data: {
        companion_id: detail.value.User.id,
        game_id: detail.value.game_id,
        amount: detail.value.price,
        remark: remark.value,
      },
    })

    toastSuccess('下单成功！')
    showOrderModal.value = false

    // 对应原项目 this.$router.push('/order/list')
    uni.navigateTo({
      url: '/pages/order/list',
    })
  }
  catch (error: any) {
    toastError(error?.msg || '下单失败')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black px-4 py-6">
    <HNavBar title="陪玩详情" :placeholder="true" />
    <view class="text-white font-bold text-lg mb-4 mt-16">
      陪玩详情
    </view>
    <view class="card overflow-hidden">
      <SmartImage :src="detail.User?.avatar" :fallback="fallbacks.avatar" cls="w-full h-56 object-cover" />
      <view class="p-4">
        <view class="flex items-center justify-between mb-2">
          <view class="text-white font-bold text-lg">
            {{ detail.User?.nickname || '未知' }}
          </view>
          <text class="chip-primary">
            认证陪玩
          </text>
        </view>
        <view class="flex items-center gap-2 mb-2">
          <text class="text-primary font-bold">
            ¥{{ detail.price }}/局
          </text>
          <text class="chip">
            {{ detail.Game?.name }}
          </text>
        </view>
        <view class="text-gray-400">
          擅长：开黑交流、战术沟通、温柔陪伴
        </view>
        <button class="btn-primary w-full mt-4" @click="showOrderModal = true">
          立即下单
        </button>
      </view>
    </view>

    <!-- Order Modal -->
    <view
      v-if="showOrderModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      @tap="showOrderModal = false"
    >
      <view
        class="bg-[#16213E] w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 border-t sm:border border-white/10 animate-slide-up"
        @tap.stop
      >
        <view class="flex justify-between items-center mb-6">
          <view class="text-lg font-bold text-white">
            确认下单
          </view>
          <button class="text-gray-400" @click="showOrderModal = false">
            ×
          </button>
        </view>

        <view class="space-y-4">
          <view class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <text class="text-gray-400">
              陪玩
            </text>
            <text class="text-white font-bold">
              {{ detail.User?.nickname }}
            </text>
          </view>
          <view class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <text class="text-gray-400">
              游戏
            </text>
            <text class="text-white font-bold">
              {{ detail.Game?.name }}
            </text>
          </view>
          <view class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <text class="text-gray-400">
              价格
            </text>
            <text class="text-primary font-bold">
              ¥{{ detail.price }}/局
            </text>
          </view>

          <view>
            <view class="block text-gray-400 text-sm mb-2">
              订单备注
            </view>
            <textarea
              v-model="remark"
              rows="3"
              class="w-full bg-black/20 text-white rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary resize-none placeholder-gray-600 text-sm"
              placeholder="请输入您的要求，如：大区、段位、语音软件等..."
            />
          </view>

          <button
            class="w-full btn-primary py-3 mt-4 flex items-center justify-center"
            :disabled="submitting"
            @click="submitOrder"
          >
            <text v-if="submitting" class="animate-spin mr-2">
              ⏳
            </text>
            {{ submitting ? '下单中...' : '确认支付' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>
