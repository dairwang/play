<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import request from '../utils/request'

const loading = ref(false)
const list = ref([])
const searchKeyword = ref('')

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/users/all', { params: { keyword: searchKeyword.value } })
    list.value = res
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">用户管理</h2>
      <div class="flex gap-4">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名..."
          class="!w-64 custom-input"
          :prefix-icon="Search"
          clearable
          @clear="fetchList"
          @keyup.enter="fetchList"
        />
      </div>
    </div>

    <!-- Table -->
    <el-card class="!bg-light !border-white/5 !text-white shadow-xl">
      <el-table 
        v-loading="loading" 
        :data="list" 
        style="width: 100%" 
        :header-cell-style="{ background: '#16213E', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
        :cell-style="{ background: '#16213E', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
        :row-style="{ background: '#16213E' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        
        <el-table-column label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : (scope.row.is_companion ? 'warning' : 'info')">
              {{ scope.row.role === 'admin' ? '管理员' : (scope.row.is_companion ? '陪玩' : '用户') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="余额" width="120">
          <template #default="scope">
            <span class="text-primary font-bold">¥{{ scope.row.balance || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="注册时间">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
