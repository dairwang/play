<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import request from '../utils/request'
import { Toast, Confirm } from '../utils/popup.js'

const loading = ref(false)
const games = ref([])
const searchKeyword = ref('')

// Dialog
const dialogVisible = ref(false)
const dialogTitle = ref('添加游戏')
const formRef = ref(null)
const formData = reactive({
  id: null,
  name: '',
  icon: '',
  cover: ''
})

const rules = {
  name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请输入图标链接', trigger: 'blur' }],
  cover: [{ required: true, message: '请输入封面链接', trigger: 'blur' }]
}

// Fetch List
const fetchGames = async () => {
  loading.value = true
  try {
    const res = await request.get('/games/list', { params: { keyword: searchKeyword.value } })
    games.value = res
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Open Dialog
const handleAdd = () => {
  dialogTitle.value = '添加游戏'
  formData.id = null
  formData.name = ''
  formData.icon = ''
  formData.cover = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑游戏'
  formData.id = row.id
  formData.name = row.name
  formData.icon = row.icon
  formData.cover = row.cover
  dialogVisible.value = true
}

// Submit
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.id) {
          await request.put(`/games/update/${formData.id}`, formData)
          Toast.success('更新成功')
        } else {
          await request.post('/games/add', formData)
          Toast.success('添加成功')
        }
        dialogVisible.value = false
        fetchGames()
      } catch (error) {
        // Handled by interceptor
      }
    }
  })
}

// Delete
const handleDelete = async (row) => {
  try {
    await Confirm(`确定要删除游戏 "${row.name}" 吗?`, '警告')
    await request.delete(`/games/delete/${row.id}`)
    Toast.success('删除成功')
    fetchGames()
  } catch (error) {}
}

onMounted(() => {
  fetchGames()
})
</script>

<template>
  <div>
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">游戏管理</h2>
      <div class="flex gap-4">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索游戏..."
          class="!w-64 custom-input"
          :prefix-icon="Search"
          clearable
          @clear="fetchGames"
          @keyup.enter="fetchGames"
        />
        <el-button type="primary" :icon="Plus" @click="handleAdd" class="!bg-primary !border-none">添加游戏</el-button>
      </div>
    </div>

    <!-- Table -->
    <el-card class="!bg-light !border-white/5 !text-white shadow-xl">
      <el-table 
        v-loading="loading" 
        :data="games" 
        style="width: 100%" 
        :header-cell-style="{ background: '#16213E', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
        :cell-style="{ background: '#16213E', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }"
        :row-style="{ background: '#16213E' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图标" width="100">
          <template #default="scope">
            <el-image 
              :src="scope.row.icon" 
              class="w-10 h-10 rounded-lg bg-white/5" 
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column label="封面" width="120">
          <template #default="scope">
             <el-image 
              :src="scope.row.cover" 
              class="w-16 h-10 rounded-lg bg-white/5" 
              fit="cover"
              :preview-src-list="[scope.row.cover]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间">
          <template #default="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="right">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      class="custom-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
        <el-form-item label="游戏名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="图标链接" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标 URL" />
        </el-form-item>
        <el-form-item label="封面链接" prop="cover">
          <el-input v-model="formData.cover" placeholder="请输入封面 URL" />
        </el-form-item>
        
        <!-- Preview -->
        <div v-if="formData.icon || formData.cover" class="flex gap-4 mt-2">
          <div v-if="formData.icon" class="text-center">
            <div class="text-xs text-gray-400 mb-1">图标预览</div>
            <img :src="formData.icon" class="w-16 h-16 rounded-lg object-cover bg-gray-700" />
          </div>
          <div v-if="formData.cover" class="text-center">
            <div class="text-xs text-gray-400 mb-1">封面预览</div>
            <img :src="formData.cover" class="w-24 h-16 rounded-lg object-cover bg-gray-700" />
          </div>
        </div>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style>
/* Global overrides for dark theme dialogs */
.custom-dialog {
  background-color: #1A1A2E !important;
}
.custom-dialog .el-dialog__title {
  color: white !important;
}
.custom-dialog .el-dialog__body {
  padding-top: 10px !important;
}
.custom-dialog .el-form-item__label {
  color: #9ca3af !important;
}
.custom-dialog .el-input__wrapper {
  background-color: #16213E !important;
  box-shadow: 0 0 0 1px #2d3748 !important;
}
</style>
