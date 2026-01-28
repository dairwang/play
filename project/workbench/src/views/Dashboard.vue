<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { User, List, Money, VideoPlay, Trophy } from '@element-plus/icons-vue'

const stats = ref({
  userCount: 0,
  orderCount: 0,
  gameCount: 0,
  companionCount: 0,
  revenue: 0
})

const loading = ref(false)

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await request.get('/users/stats')
    stats.value = res
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-white mb-6">仪表盘</h2>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" v-loading="loading">
      
      <!-- Total Users -->
      <el-card class="!bg-light !border-white/5 !text-white shadow-xl hover:translate-y-[-4px] transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">总用户数</p>
            <h3 class="text-3xl font-bold">{{ stats.userCount }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <el-icon class="text-2xl"><User /></el-icon>
          </div>
        </div>
      </el-card>

      <!-- Total Orders -->
      <el-card class="!bg-light !border-white/5 !text-white shadow-xl hover:translate-y-[-4px] transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">总订单数</p>
            <h3 class="text-3xl font-bold">{{ stats.orderCount }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-warning">
            <el-icon class="text-2xl"><List /></el-icon>
          </div>
        </div>
      </el-card>

      <!-- Total Companions -->
      <el-card class="!bg-light !border-white/5 !text-white shadow-xl hover:translate-y-[-4px] transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">入驻陪玩</p>
            <h3 class="text-3xl font-bold">{{ stats.companionCount }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
            <el-icon class="text-2xl"><Trophy /></el-icon>
          </div>
        </div>
      </el-card>

      <!-- Total Revenue -->
      <el-card class="!bg-light !border-white/5 !text-white shadow-xl hover:translate-y-[-4px] transition-transform duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm mb-1">总交易额</p>
            <h3 class="text-3xl font-bold text-primary">¥{{ stats.revenue }}</h3>
          </div>
          <div class="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center text-danger">
            <el-icon class="text-2xl"><Money /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Quick Actions or Recent Activity could go here -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <el-card class="!bg-light !border-white/5 !text-white shadow-xl">
        <template #header>
          <div class="flex justify-between items-center">
            <span>系统概况</span>
          </div>
        </template>
        <div class="space-y-4">
           <div class="flex justify-between items-center border-b border-white/5 pb-2">
             <span>支持游戏数量</span>
             <span class="font-bold">{{ stats.gameCount }}</span>
           </div>
           <div class="flex justify-between items-center border-b border-white/5 pb-2">
             <span>系统运行状态</span>
             <span class="text-success font-bold">正常</span>
           </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
