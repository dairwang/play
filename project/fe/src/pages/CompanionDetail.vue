<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black px-4 py-6">
    <HeaderBar title="陪玩详情" />
    <div class="text-white font-bold text-lg mb-4 mt-16">陪玩详情</div>
    <div class="card overflow-hidden">
      <SmartImage :src="detail.User?.avatar" :fallback="fallbacks.avatar" cls="w-full h-56 object-cover" />
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-white font-bold text-lg">{{ detail.User?.nickname || '未知' }}</div>
          <span class="chip-primary">认证陪玩</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-primary font-bold">¥{{ detail.price }}/局</span>
          <span class="chip">{{ detail.Game?.name }}</span>
        </div>
        <div class="text-gray-400">擅长：开黑交流、战术沟通、温柔陪伴</div>
        <button class="btn-primary w-full mt-4" @click="showOrderModal = true">立即下单</button>
      </div>
    </div>

    <!-- Order Modal -->
    <div v-if="showOrderModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="showOrderModal = false">
      <div class="bg-[#16213E] w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 border-t sm:border border-white/10 animate-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-white">确认下单</h3>
          <button @click="showOrderModal = false" class="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span class="text-gray-400">陪玩</span>
            <span class="text-white font-bold">{{ detail.User?.nickname }}</span>
          </div>
          <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span class="text-gray-400">游戏</span>
            <span class="text-white font-bold">{{ detail.Game?.name }}</span>
          </div>
          <div class="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span class="text-gray-400">价格</span>
            <span class="text-primary font-bold">¥{{ detail.price }}/局</span>
          </div>

          <div>
            <label class="block text-gray-400 text-sm mb-2">订单备注</label>
            <textarea 
              v-model="remark" 
              rows="3" 
              class="w-full bg-black/20 text-white rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary resize-none placeholder-gray-600 text-sm"
              placeholder="请输入您的要求，如：大区、段位、语音软件等..."
            ></textarea>
          </div>

          <button 
            @click="submitOrder" 
            :disabled="submitting"
            class="w-full btn-primary py-3 mt-4 flex items-center justify-center"
          >
            <span v-if="submitting" class="animate-spin mr-2">⏳</span>
            {{ submitting ? '下单中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../common/request.js'
import HeaderBar from '../components/HeaderBar.vue'
import SmartImage from '../components/SmartImage.vue'
import { DEFAULT_AVATAR } from '../common/images.js'
import { Toast } from '../common/popup.js'

export default {
  name: 'CompanionDetail',
  components: { HeaderBar, SmartImage },
  data() {
    return { 
      detail: {}, 
      fallbacks: { avatar: DEFAULT_AVATAR },
      showOrderModal: false,
      remark: '',
      submitting: false
    }
  },
  async mounted() {
    const id = this.$route.params.id
    try {
      const res = await request({ url: `/companions/detail?id=${id}` })
      this.detail = res.data
    } catch (e) {
      console.error(e)
    }
  },
  methods: {
    async submitOrder() {
      if (!this.remark.trim()) {
        // Optional: require remark? No.
      }

      this.submitting = true
      try {
        await request({
          url: '/orders/create',
          method: 'POST',
          data: {
            companion_id: this.detail.User.id,
            game_id: this.detail.game_id,
            amount: this.detail.price,
            remark: this.remark
          }
        })
        Toast.success('下单成功！')
        this.showOrderModal = false
        this.$router.push('/order/list')
      } catch (error) {
        Toast.error(error.msg || '下单失败')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
