<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { Toast } from '../utils/popup.js'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const formRef = ref(null)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await authStore.login(form.username, form.password)
        if (success) {
          Toast.success('登录成功')
          router.push('/')
        }
      } catch (error) {
        // Error handled in interceptor or store
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-secondary">
    <!-- Glassmorphism Card -->
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/10">
      
      <!-- Logo / Title -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <el-icon class="text-primary text-3xl"><User /></el-icon>
        </div>
        <h2 class="text-2xl font-bold text-white">管理后台登录</h2>
        <p class="text-gray-400 text-sm mt-2">Play Companion Admin System</p>
      </div>

      <!-- Login Form -->
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="用户名 / Admin" 
            :prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="密码 / Password" 
            :prefix-icon="Lock"
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          class="w-full mt-4 !bg-primary !border-none hover:!bg-red-600 !h-12 !text-lg !rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/30"
          :loading="loading"
          @click="handleLogin"
        >
          立即登录
        </el-button>
      </el-form>
      
      <!-- Footer -->
      <div class="mt-6 text-center text-gray-500 text-xs">
        &copy; 2023 Play Companion Inc.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Override Element Plus Input Styles for Dark Theme */
:deep(.el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px 12px;
  transition: all 0.3s;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #E94560 !important;
  background-color: rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 0 0 1px #E94560 !important;
}

:deep(.el-input__inner) {
  color: white !important;
  height: 40px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}
</style>
