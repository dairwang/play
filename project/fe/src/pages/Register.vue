<template>
  <div class="min-h-screen bg-gradient-to-b from-secondary via-dark to-black grid place-items-center px-6">
    <HeaderBar title="注册" />
    <div class="glass w-full max-w-md p-8 rounded-3xl mt-16">
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-pink-500 grid place-items-center animate-[pulse-glow_3s_ease_infinite]">➕</div>
        <div class="mt-4 hero-title">创建账号</div>
        <div class="mt-1 text-gray-400 text-sm">加入我们，开启电竞社交</div>
      </div>
      <div class="mb-4">
        <div class="input">
          <span class="mr-3 text-gray-400">👤</span>
          <input v-model="form.username" type="text" placeholder="用户名" class="input-field" />
        </div>
      </div>
      <div class="mb-4">
        <div class="input">
          <span class="mr-3 text-gray-400">💖</span>
          <input v-model="form.nickname" type="text" placeholder="昵称" class="input-field" />
        </div>
      </div>
      <div class="mb-6">
        <div class="input">
          <span class="mr-3 text-gray-400">🔒</span>
          <input v-model="form.password" type="password" placeholder="密码" class="input-field" />
        </div>
      </div>
      <button class="btn-primary w-full" @click="handleRegister">注 册</button>
      <div class="mt-6 flex items-center justify-center text-sm">
        <span class="text-gray-500">已有账号？</span>
        <span class="text-primary ml-2 font-bold cursor-pointer" @click="goLogin">立即登录</span>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../common/request.js'
import HeaderBar from '../components/HeaderBar.vue'
import { Toast } from '../common/popup.js'

export default {
  name: 'Register',
  components: { HeaderBar },
  data() {
    return {
      form: { username: '', nickname: '', password: '' },
      loading: false,
    }
  },
  methods: {
    goLogin() {
      this.$router.back()
    },
    async handleRegister() {
      if (!this.form.username || !this.form.password || !this.form.nickname) {
        Toast.error('请填写完整信息')
        return
      }
      this.loading = true
      try {
        await request({ url: '/auth/register', method: 'POST', data: this.form })
        Toast.success('注册成功')
        this.goLogin()
      } catch (e) {
        console.error(e)
        Toast.error(e.msg || '注册失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
