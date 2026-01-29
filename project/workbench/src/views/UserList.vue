<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Delete, Edit, Search } from '@element-plus/icons-vue'
import request from '../utils/request'
import { Toast, Confirm } from '../utils/popup.js'

const loading = ref(false)
const list = ref([])
const searchKeyword = ref('')

// 编辑弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('编辑用户')
const formRef = ref(null)
const formData = reactive({
  id: null,
  username: '',
  nickname: '',
  role: 'user',
  is_companion: false,
  balance: 0,
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/users/all', { params: { keyword: searchKeyword.value } })
    list.value = res
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString()
}

const handleEdit = (row) => {
  dialogTitle.value = `编辑用户 #${row.id}`
  formData.id = row.id
  formData.username = row.username
  formData.nickname = row.nickname
  formData.role = row.role || 'user'
  formData.is_companion = !!row.is_companion
  formData.balance = Number(row.balance || 0)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value)
    return

  await formRef.value.validate(async (valid) => {
    if (!valid)
      return
    try {
      await request.put(`/users/update/${formData.id}`, {
        nickname: formData.nickname,
        role: formData.role,
        is_companion: formData.is_companion,
        balance: formData.balance,
      })
      Toast.success('用户信息已更新')
      dialogVisible.value = false
      fetchList()
    }
    catch (error) {
      // 统一在拦截器中处理
    }
  })
}

const handleDelete = async (row) => {
  try {
    await Confirm(`确定要删除用户「${row.username}」吗？`, '警告')
    await request.delete(`/users/delete/${row.id}`)
    Toast.success('用户已删除')
    fetchList()
  }
  catch (error) {
    // 取消时 error 为 false，可忽略
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
      <h2 class="text-2xl font-bold text-white">
        用户管理
      </h2>
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
        <el-table-column
          label="操作"
          width="180"
          align="right"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑用户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      class="custom-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item label="用户名">
          <el-input v-model="formData.username" disabled />
        </el-form-item>
        <el-form-item
          label="昵称"
          prop="nickname"
        >
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item
          label="角色"
          prop="role"
        >
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否陪玩">
          <el-switch v-model="formData.is_companion" />
        </el-form-item>
        <el-form-item label="余额（元）">
          <el-input
            v-model="formData.balance"
            type="number"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
