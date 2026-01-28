<script setup>
import { useRoute } from 'vue-router'
import { 
  Odometer, 
  User, 
  VideoPlay, 
  List, 
  Money, 
  Setting 
} from '@element-plus/icons-vue'

const route = useRoute()

const menuItems = [
  { index: '/', icon: Odometer, title: '仪表盘' },
  { index: '/users', icon: User, title: '用户管理' },
  { index: '/games', icon: VideoPlay, title: '游戏管理' },
  { index: '/orders', icon: List, title: '订单管理' },
  { index: '/finance', icon: Money, title: '资金结算' },
  { index: '/audit', icon: Setting, title: '陪玩审核' },
]
</script>

<template>
  <div class="h-full bg-light border-r border-white/5 flex flex-col">
    <!-- Logo -->
    <div class="h-16 flex items-center justify-center border-b border-white/5">
      <el-icon class="text-primary text-2xl mr-2"><VideoPlay /></el-icon>
      <span class="text-xl font-bold text-white tracking-wider">PLAY ADMIN</span>
    </div>

    <!-- Menu -->
    <el-menu
      :default-active="route.path"
      class="el-menu-vertical-demo flex-1 !bg-transparent !border-none"
      text-color="#9ca3af"
      active-text-color="#E94560"
      router
    >
      <el-menu-item 
        v-for="item in menuItems" 
        :key="item.index" 
        :index="item.index"
        class="!my-1 !mx-2 !rounded-lg hover:!bg-white/5"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
:deep(.el-menu-item.is-active) {
  background-color: rgba(233, 69, 96, 0.1) !important;
  font-weight: 600;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style>
