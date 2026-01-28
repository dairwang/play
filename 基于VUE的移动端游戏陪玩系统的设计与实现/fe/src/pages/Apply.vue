<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black px-4 py-6">
    <HeaderBar title="申请陪玩" />
    <div class="text-white font-bold text-lg mb-4 mt-16">申请成为陪玩</div>
    
    <div class="card p-4 bg-[#16213E] rounded-xl border border-white/5">
      <div class="mb-6 text-gray-400 text-sm">填写下方信息提交审核，审核通过后即可接单</div>
      
      <!-- Game Selection -->
      <div class="mb-4">
        <label class="block text-gray-400 text-xs mb-2">选择游戏</label>
        <div class="relative">
          <select 
            v-model="form.game_id" 
            class="w-full bg-[#0f3460] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary appearance-none"
          >
            <option value="" disabled>请选择擅长的游戏</option>
            <option v-for="game in games" :key="game.id" :value="game.id">
              {{ game.name }}
            </option>
          </select>
          <div class="absolute right-4 top-3.5 pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z"/></svg>
          </div>
        </div>
      </div>

      <!-- Price Input -->
      <div class="mb-4">
        <label class="block text-gray-400 text-xs mb-2">服务价格 (元/局)</label>
        <input 
          v-model="form.price" 
          type="number" 
          class="w-full bg-[#0f3460] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder-gray-500"
          placeholder="请输入每局价格" 
        />
      </div>

      <!-- Description Input -->
      <div class="mb-6">
        <label class="block text-gray-400 text-xs mb-2">自我介绍</label>
        <textarea 
          v-model="form.description" 
          rows="4" 
          class="w-full bg-[#0f3460] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder-gray-500 resize-none"
          placeholder="介绍一下你的技术特点、段位等优势..." 
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button 
        @click="submit" 
        :disabled="submitting"
        class="w-full bg-primary text-white font-bold py-3 rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
      >
        <span v-if="submitting" class="mr-2 animate-spin">
          <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ submitting ? '提交中...' : '提交审核' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeaderBar from '../components/HeaderBar.vue'
import request from '../common/request'
import { Toast } from '../common/popup.js'

const router = useRouter()
const games = ref([])
const submitting = ref(false)

const form = reactive({
  game_id: '',
  price: '',
  description: ''
})

// Fetch available games
const fetchGames = async () => {
  try {
    const res = await request({ url: '/games/list' })
    games.value = res.data
  } catch (error) {
    console.error('Failed to fetch games:', error)
  }
}

// Submit application
const submit = async () => {
  if (!form.game_id) return Toast.error('请选择游戏')
  if (!form.price) return Toast.error('请输入价格')
  if (!form.description) return Toast.error('请输入自我介绍')

  submitting.value = true
  try {
    await request({
      url: '/companions/apply',
      method: 'POST',
      data: {
        game_id: form.game_id,
        price: Number(form.price),
        description: form.description
      }
    })
    Toast.success('申请提交成功，请等待审核')
    router.push('/user') // Redirect to user center
  } catch (error) {
    Toast.error(error.msg || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchGames()
})
</script>
