<script setup>
import { ref, onMounted } from 'vue'
import { Check, Close, Search } from '@element-plus/icons-vue'
import request from '../utils/request'
import { Toast, Confirm } from '../utils/popup.js'

const loading = ref(false)
const list = ref([])
const activeTab = ref('pending')

// Fetch List
const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/companions/audit/list', { params: { status: activeTab.value } })
    list.value = res
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Audit Action
const handleAudit = async (row, status) => {
  const actionText = status === 'approved' ? '通过' : '驳回'
  const confirmText = status === 'approved' 
    ? `确定通过用户 "${row.User?.nickname}" 的申请吗?` 
    : `确定驳回此申请吗?`

  try {
    await Confirm(confirmText, '审核确认')
    await request.post(`/companions/audit/${row.id}`, { status })
    Toast.success(`已${actionText}`)
    fetchList()
  } catch (error) {}
}

const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status]
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
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
      <h2 class="text-2xl font-bold text-white">陪玩审核</h2>
      
      <el-radio-group v-model="activeTab" @change="fetchList" fill="#E94560">
        <el-radio-button label="pending">待审核</el-radio-button>
        <el-radio-button label="approved">已通过</el-radio-button>
        <el-radio-button label="rejected">已驳回</el-radio-button>
      </el-radio-group>
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
        <el-table-column label="申请用户" width="200">
          <template #default="scope">
            <div class="flex items-center">
              <el-avatar :size="32" :src="scope.row.User?.avatar" class="mr-2" />
              <span>{{ scope.row.User?.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="Game.name" label="申请游戏" width="150" />
        
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <span class="text-primary font-bold">¥{{ scope.row.price }}</span> / 局
          </template>
        </el-table-column>

        <el-table-column prop="description" label="自我介绍" show-overflow-tooltip />

        <el-table-column prop="created_at" label="申请时间" width="180">
          <template #default="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.audit_status)" size="small">
              {{ getStatusLabel(scope.row.audit_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column v-if="activeTab === 'pending'" label="操作" width="180" align="right">
          <template #default="scope">
            <el-button link type="success" :icon="Check" @click="handleAudit(scope.row, 'approved')">通过</el-button>
            <el-button link type="danger" :icon="Close" @click="handleAudit(scope.row, 'rejected')">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
:deep(.el-radio-button__inner) {
  background-color: #1A1A2E;
  border-color: rgba(255,255,255,0.1);
  color: #9ca3af;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid rgba(255,255,255,0.1);
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #E94560;
  border-color: #E94560;
  color: white;
  box-shadow: -1px 0 0 0 #E94560;
}
</style>
