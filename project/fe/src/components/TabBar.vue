<template>
  <div class="fixed bottom-0 left-0 right-0 h-16 bg-dark/60 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-50 pb-safe">
    <div
      v-for="(item, index) in tabs"
      :key="index"
      class="flex flex-col items-center justify-center flex-1 h-full active:bg-white/5 min-w-[80px] py-1"
      @click="go(item.path)"
    >
      <div class="mb-1 transition-all duration-300" :class="isActive(item.path) ? 'scale-110' : ''">
        <Icon :icon="item.icon" :class="isActive(item.path) ? 'text-primary' : 'text-gray-400'" width="26" height="26" />
      </div>
      <span class="text-xs transition-colors duration-300" :class="isActive(item.path) ? 'text-primary font-bold' : 'text-gray-500'">{{ item.text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    currentPath: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      tabs: [
        { text: '首页', path: '/', icon: 'mdi:home' },
        { text: '我的', path: '/user', icon: 'mdi:account' }
      ]
    }
  },
  methods: {
    isActive(path) {
      return this.$route.path === path
    },
    go(path) {
      this.$router.push(path)
    }
  }
}
</script>

<script setup>
import { Icon } from '@iconify/vue'
</script>

<style scoped>
.pb-safe { padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom); }
</style>
