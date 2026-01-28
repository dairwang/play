<template>
  <div class="fixed top-0 left-0 w-full z-50">
    <div class="h-14 bg-dark/60 backdrop-blur-lg border-b border-white/10 px-4 flex items-center justify-between">
      <button class="flex items-center text-gray-300 active:scale-95 transition-transform" @click="goBack">
        <Icon icon="mdi:chevron-left" width="26" height="26" />
        <span class="ml-1 text-sm">返回</span>
      </button>
      <div class="text-white font-bold">{{ title }}</div>
      <div class="w-10"></div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
const props = defineProps({ title: { type: String, default: '' } })
const router = useRouter()
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>
