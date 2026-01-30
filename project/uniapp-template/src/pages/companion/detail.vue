<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/utils/request'
import SmartImage from '@/components/SmartImage.vue'
import { DEFAULT_AVATAR } from '@/common/images'

const detail = ref<any>({})
const showOrderModal = ref(false)
const remark = ref('')
const durationHours = ref<number | null>(1)
const submitting = ref(false)
const is_followed = ref(false)
const followLoading = ref(false)
const hasToken = ref(!!uni.getStorageSync('token'))

const fallbacks = {
  avatar: DEFAULT_AVATAR,
}

const totalAmount = computed(() => {
  const hours = Number(durationHours.value) || 0
  const price = Number(detail.value?.price) || 0
  if (!hours || !price)
    return 0
  return Number((hours * price).toFixed(2))
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

async function checkFollowState(companionUserId: number) {
  if (!hasToken.value || !companionUserId)
    return
  try {
    const res: any = await request({ url: `/users/${companionUserId}/follow/check` })
    is_followed.value = res.data?.is_followed ?? false
  }
  catch {
    is_followed.value = false
  }
}

async function toggleFollow() {
  const companionUserId = detail.value?.User?.id
  if (!companionUserId) {
    toastError('陪玩信息缺失')
    return
  }
  if (!hasToken.value) {
    toastError('请先登录')
    return
  }
  followLoading.value = true
  try {
    if (is_followed.value) {
      await request({
        url: `/users/${companionUserId}/follow`,
        method: 'DELETE',
      })
      is_followed.value = false
      toastSuccess('已取消关注')
    }
    else {
      await request({
        url: `/users/${companionUserId}/follow`,
        method: 'POST',
      })
      is_followed.value = true
      toastSuccess('关注成功')
    }
  }
  catch (error: any) {
    toastError(error?.msg || '操作失败')
  }
  finally {
    followLoading.value = false
  }
}

onLoad(async (options) => {
  const id = options?.id
  if (!id)
    return
  hasToken.value = !!uni.getStorageSync('token')

  try {
    const res: any = await request({ url: `/companions/detail?id=${id}` })
    detail.value = res.data
    if (detail.value?.User?.id)
      await checkFollowState(detail.value.User.id)
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

  const hours = Number(durationHours.value)
  if (!hours || hours <= 0) {
    toastError('请输入有效的陪玩时长（小时）')
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
        // 金额 = 单价 * 时长
        amount: totalAmount.value,
        duration_hours: hours,
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
  <view class="page-container min-h-screen px-4 py-6">
    <HNavBar title="陪玩详情" :placeholder="true" />
    <view class="text-white font-bold text-lg mb-4">
      陪玩详情
    </view>
    <view class="card overflow-hidden">
      <SmartImage :src="detail.User?.avatar" :fallback="fallbacks.avatar" cls="w-full h-156px object-cover" />
      <view class="p-4">
        <view class="flex items-center justify-between mb-2">
          <view class="text-white font-bold text-lg">
            {{ detail.User?.nickname || '未知' }}
            <text class="chip-primary text-white" text="10px">
              认证陪玩
            </text>
          </view>
          <view class="flex items-center gap-2">
            <button
              v-if="hasToken"
              class="chip text-sm px-3 py-1 rounded-full border transition-colors"
              :class="is_followed ? 'border-primary bg-primary/20 text-primary' : 'border-white/30  c-[#291a52]'"
              :disabled="followLoading"
              @click="toggleFollow"
            >
              {{ followLoading ? '...' : (is_followed ? '已关注' : '关注') }}
            </button>
          </view>
        </view>
        <!-- 评价结果：陪玩昵称下方展示 -->
        <view v-if="detail.evaluation_count > 0" class="flex items-center gap-2 mb-2">
          <u-rate :model-value="detail.average_rating" :count="5" size="14" readonly active-color="#FF2D55" />
          <text class="text-gray-400 text-sm">
            {{ detail.average_rating }} 分 · 共 {{ detail.evaluation_count }} 条评价
          </text>
        </view>
        <view class="flex items-center gap-2 mb-2">
          <text class="text-primary font-bold ">
            ¥{{ detail.price }}/时
          </text>
          <text class="chip text-white">
            {{ detail.Game?.name }}
          </text>
        </view>
        <!-- 陪玩签名 -->
        <view class="text-gray-400">
          {{ detail.User?.description }}
        </view>
        <button class="btn-primary w-full mt-4" @click="showOrderModal = true">
          立即下单
        </button>
      </view>
    </view>

    <!-- 确认下单：使用 u-popup 底部弹出，参考订单评价弹层 -->
    <u-popup
      v-model:show="showOrderModal"
      mode="bottom"
      :round="20"
      :close-on-click-overlay="true"
      :closeable="true"
      bg-color="#1C0F3C"
    >
      <view class="p-6 pb-10">
        <view class="flex justify-between items-center mb-4">
          <text class="text-lg font-bold text-white">
            确认下单
          </text>
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
              单价
            </text>
            <text class="text-primary font-bold">
              ¥{{ detail.price }}/小时
            </text>
          </view>

          <!-- 陪玩时长输入 -->
          <view class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <text class="text-gray-400">
              陪玩时长
            </text>
            <view class="flex items-center gap-2">
              <input
                v-model.number="durationHours"
                type="number"
                class="w-50px bg-black/30 text-white rounded px-2 py-1 text-sm text-right"
                placeholder="小时"
                min="1"
              >
              <text class="text-gray-400 text-xs">
                小时
              </text>
            </view>
          </view>

          <!-- 总金额 -->
          <view class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <text class="text-gray-400">
              总金额
            </text>
            <text class="text-primary font-bold">
              ¥{{ totalAmount }}
            </text>
          </view>

          <!-- 备注 -->
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
            {{ submitting ? '下单中...' : `确认支付 ¥${totalAmount}` }}
          </button>
        </view>
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
