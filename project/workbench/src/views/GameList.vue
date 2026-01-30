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

// 处理图片 URL，解决跨域问题
const processImageUrl = (url) => {
  if (!url) return ''
  
  // 如果 URL 已经包含代理，直接返回
  if (url.includes('images.weserv.nl') || url.includes('proxy')) {
    return url
  }
  
  // 对于某些可能有跨域问题的图片服务器，尝试通过代理访问
  // 如果图片无法加载，可以启用下面的代理方案
  // 注意：某些图片服务器可能不允许代理访问
  
  // 检测可能需要代理的域名
  const needProxyDomains = ['huaban.com', 'pinterest.com', 'imgur.com']
  const needsProxy = needProxyDomains.some(domain => url.includes(domain))
  
  if (needsProxy) {
    // 使用 weserv.nl 图片代理服务
    try {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=webp&q=85`
    } catch (e) {
      console.warn('图片 URL 编码失败，使用原 URL:', e)
      return url
    }
  }
  
  return url
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
  } catch (error) {
    // 用户取消确认对话框时，error 为 false，不需要处理
    if (error === false) {
      return
    }
    // 其他错误已经在 request 拦截器中处理并显示 Toast
    // 这里可以添加额外的错误处理逻辑，比如记录日志等
    console.error('删除游戏失败:', error)
  }
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
              :src="processImageUrl(scope.row.icon)" 
              class="w-10 h-10 rounded-lg bg-white/5" 
              fit="cover"
              referrerpolicy="no-referrer"
              crossorigin="anonymous"
            >
              <template #error>
                <div class="w-full h-full flex items-center justify-center bg-white/5 text-gray-500 text-xs">
                  加载失败
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column label="封面" width="120">
          <template #default="scope">
             <el-image 
              :src="processImageUrl(scope.row.cover)" 
              class="w-16 h-10 rounded-lg bg-white/5" 
              fit="cover"
              :preview-src-list="[processImageUrl(scope.row.cover)]"
              preview-teleported
              referrerpolicy="no-referrer"
              crossorigin="anonymous"
            >
              <template #error>
                <div class="w-full h-full flex items-center justify-center bg-white/5 text-gray-500 text-xs">
                  加载失败
                </div>
              </template>
            </el-image>
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
            <el-image 
              :src="processImageUrl(formData.icon)" 
              class="w-16 h-16 rounded-lg bg-gray-700"
              fit="cover"
              :preview-src-list="[processImageUrl(formData.icon)]"
              preview-teleported
              referrerpolicy="no-referrer"
              crossorigin="anonymous"
              :hide-on-click-modal="true"
            >
              <template #error>
                <div class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500 text-xs">
                  加载失败<br>
                  <span class="text-[10px] mt-1">请检查图片 URL</span>
                </div>
              </template>
            </el-image>
          </div>
          <div v-if="formData.cover" class="text-center">
            <div class="text-xs text-gray-400 mb-1">封面预览</div>
            <el-image 
              :src="processImageUrl(formData.cover)" 
              class="w-24 h-16 rounded-lg bg-gray-700"
              fit="cover"
              :preview-src-list="[processImageUrl(formData.cover)]"
              preview-teleported
              referrerpolicy="no-referrer"
              crossorigin="anonymous"
              :hide-on-click-modal="true"
            >
              <template #error>
                <div class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500 text-xs">
                  加载失败<br>
                  <span class="text-[10px] mt-1">请检查图片 URL</span>
                </div>
              </template>
            </el-image>
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
