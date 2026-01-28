<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { ArrowDown, Bell, Expand } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="h-16 bg-light/50 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6">
    <!-- Left -->
    <div class="flex items-center">
      <el-button link class="!text-gray-400 hover:!text-white">
        <el-icon class="text-xl"><Expand /></el-icon>
      </el-button>
      <h2 class="ml-4 text-white font-medium">{{ $route.meta.title || 'Dashboard' }}</h2>
    </div>

    <!-- Right -->
    <div class="flex items-center space-x-6">
      <!-- Notification -->
      <el-badge is-dot class="item cursor-pointer">
        <el-icon class="text-gray-400 hover:text-white text-xl transition-colors"><Bell /></el-icon>
      </el-badge>

      <!-- User Dropdown -->
      <el-dropdown trigger="click">
        <div class="flex items-center cursor-pointer outline-none">
          <el-avatar :size="32" :src="authStore.user?.avatar || 'https://placehold.co/100x100'" class="mr-2 border border-primary/50" />
          <span class="text-gray-200 text-sm">{{ authStore.user?.nickname || 'Admin' }}</span>
          <el-icon class="el-icon--right text-gray-500"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="!bg-light !border-white/10">
            <el-dropdown-item class="!text-gray-300 hover:!bg-white/5">个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout" class="!text-red-400 hover:!bg-red-500/10">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-dropdown-menu__item:not(.is-disabled):focus) {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}
</style>
