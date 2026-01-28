<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black grid place-items-center px-6">
    <HeaderBar title="登录" />
    <div class="glass w-full max-w-md p-8 rounded-3xl mt-16">
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-pink-500 grid place-items-center animate-[pulse-glow_3s_ease_infinite]">🎮</div>
        <div class="mt-4 hero-title">欢迎回来</div>
        <div class="mt-1 text-gray-400 text-sm">登录以开始您的陪玩之旅</div>
      </div>
      <div class="mb-4">
        <div class="input">
          <span class="mr-3 text-gray-400">👤</span>
          <input v-model="form.username" type="text" placeholder="用户名" class="input-field" />
        </div>
      </div>
      <div class="mb-6">
        <div class="input">
          <span class="mr-3 text-gray-400">🔒</span>
          <input v-model="form.password" type="password" placeholder="密码" class="input-field" />
        </div>
      </div>
      <button class="btn-primary w-full" @click="handleLogin">登 录</button>
      <div class="mt-6 flex items-center justify-center text-sm">
        <span class="text-gray-500">还没有账号？</span>
        <span class="text-primary ml-2 font-bold cursor-pointer" @click="goRegister">立即注册</span>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../common/request.js'
import HeaderBar from '../components/HeaderBar.vue'
import { Toast } from '../common/popup.js'

export default {
  name: 'Login',
  components: { HeaderBar },
  data() {
    return {
      form: { username: '', password: '' },
      loading: false,
    }
  },
  methods: {
    goRegister() {
      this.$router.push('/register')
    },
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        Toast.error('请输入用户名和密码')
        return
      }
      this.loading = true
      try {
        const res = await request({ url: '/auth/login', method: 'POST', data: this.form })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        Toast.success('登录成功')
        this.$router.push('/')
      } catch (e) {
        console.error(e)
        Toast.error(e.msg || '登录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
