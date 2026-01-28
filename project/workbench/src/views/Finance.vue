<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import request from '../utils/request'

const loading = ref(false)
const list = ref([])
const keyword = ref('')

const statusTabs = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const activeStatus = ref('pending')

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/refunds/all', {
      params: {
        status: activeStatus.value,
        keyword: keyword.value
      }
    })
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
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const handleApprove = async (row) => {
  try {
    await request.post(`/refunds/${row.id}/approve`)
    fetchList()
  } catch (error) {
    console.error(error)
  }
}

const handleReject = async (row) => {
  try {
    await request.post(`/refunds/${row.id}/reject`)
    fetchList()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">资金结算 / 退款审核</h2>
      </div>

      <div class="flex items-center gap-4">
        <el-input
          v-model="keyword"
          placeholder="搜索订单号 / 申请人"
          class="!w-64 custom-input"
          :prefix-icon="Search"
          clearable
          @clear="fetchList"
          @keyup.enter="fetchList"
        />

        <div class="bg-dark/40 rounded-full p-1 flex gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="px-4 py-1.5 rounded-full text-sm transition-colors"
            :class="activeStatus === tab.value ? 'bg-primary text-white font-semibold' : 'text-gray-300 hover:bg-white/5'"
            @click="() => { activeStatus = tab.value; fetchList() }"
          >
            {{ tab.label }}
          </button>
        </div>
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
        <el-table-column prop="Order.order_no" label="订单号" width="200">
          <template #default="scope">
            {{ scope.row.Order?.order_no }}
          </template>
        </el-table-column>

        <el-table-column label="申请人" width="140">
          <template #default="scope">
            {{ scope.row.Applicant?.nickname }}
          </template>
        </el-table-column>

        <el-table-column label="陪玩师" width="140">
          <template #default="scope">
            {{ scope.row.Order?.Companion?.nickname }}
          </template>
        </el-table-column>

        <el-table-column label="退款金额" width="120">
          <template #default="scope">
            <span class="text-primary font-bold">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="退款原因" min-width="200" show-overflow-tooltip />

        <el-table-column label="申请时间" width="180">
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

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div v-if="scope.row.status === 'pending'" class="flex gap-2">
              <el-button
                type="success"
                size="small"
                @click="handleApprove(scope.row)"
              >
                审核通过
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleReject(scope.row)"
              >
                拒绝
              </el-button>
            </div>
            <span v-else class="text-gray-400 text-xs">
              已{{ getStatusLabel(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

