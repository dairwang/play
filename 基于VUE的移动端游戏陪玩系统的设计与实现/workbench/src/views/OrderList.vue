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
    const res = await request.get('/orders/all', { params: { keyword: searchKeyword.value } })
    list.value = res
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    accepted: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status]
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待接单',
    accepted: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status]
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">订单管理</h2>
      <div class="flex gap-4">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号..."
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
        <el-table-column prop="order_no" label="订单号" width="180" />
        
        <el-table-column label="游戏" width="120">
          <template #default="scope">
            {{ scope.row.Game?.name }}
          </template>
        </el-table-column>

        <el-table-column label="下单用户">
          <template #default="scope">
            {{ scope.row.Client?.nickname }}
          </template>
        </el-table-column>

        <el-table-column label="接单陪玩">
          <template #default="scope">
            {{ scope.row.Companion?.nickname }}
          </template>
        </el-table-column>

        <el-table-column label="金额" width="100">
          <template #default="scope">
            <span class="text-primary font-bold">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="下单时间" width="180">
          <template #default="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
