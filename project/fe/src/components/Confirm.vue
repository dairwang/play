<template>
  <transition name="confirm-fade">
    <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleCancel"></div>
      
      <!-- Modal -->
      <div class="relative w-full max-w-sm bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl p-6 transform transition-all">
        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center text-3xl">
            ❓
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>
          <p class="text-gray-400">{{ message }}</p>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="handleCancel"
            class="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button 
            @click="handleConfirm"
            class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e94560] to-[#ff6b6b] text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all transform hover:-translate-y-0.5"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '确认'
  },
  message: String,
  onConfirm: Function,
  onCancel: Function
})

const visible = ref(false)

onMounted(() => {
  visible.value = true
})

const close = () => {
  visible.value = false
}

const handleConfirm = () => {
  if (props.onConfirm) props.onConfirm()
  close()
}

const handleCancel = () => {
  if (props.onCancel) props.onCancel()
  close()
}
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.3s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
