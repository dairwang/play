<template>
  <transition name="toast-fade">
    <div v-if="visible" class="fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 min-w-[300px]"
      :class="[
        type === 'success' ? 'bg-green-500/20 text-green-200' : 
        type === 'error' ? 'bg-red-500/20 text-red-200' : 
        'bg-blue-500/20 text-blue-200'
      ]"
    >
      <div class="text-xl">
        <span v-if="type === 'success'">✅</span>
        <span v-else-if="type === 'error'">❌</span>
        <span v-else>ℹ️</span>
      </div>
      <div class="flex-1 font-medium">{{ message }}</div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info'
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const visible = ref(false)

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
