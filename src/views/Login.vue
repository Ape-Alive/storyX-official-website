<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">用户登录</h2>
          <p class="auth-subtitle">ACCESS YOUR STUDIO</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="auth-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              type="email"
              placeholder="邮箱账号"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="访问密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="auth-submit-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录工作台
            </el-button>
          </el-form-item>
        </el-form>

        <div class="auth-footer">
          <span class="auth-link-text">还没有账号？</span>
          <router-link to="/register" class="auth-link">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { setToken, setUserInfo, getToken } from '@/utils/storage'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  deviceFingerprint: '' // 可选，暂时留空
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      const response = await login({
        email: loginForm.email,
        password: loginForm.password,
        deviceFingerprint: loginForm.deviceFingerprint || undefined
      })

      if (response.success && response.data) {
        // 保存 token 和用户信息
        if (response.data.token) {
          setToken(response.data.token)
          console.log('Token 已保存:', response.data.token)
        }
        if (response.data.user) {
          setUserInfo(response.data.user)
        }

        // 验证 token 是否已保存
        const savedToken = getToken()
        console.log('保存后的 Token:', savedToken)

        ElMessage.success('登录成功！')

        // 直接跳转，token 已同步保存
        const redirect = router.currentRoute.value.query.redirect || '/dashboard/home'
        console.log('准备跳转到:', redirect)

        // 使用 replace 而不是 push，避免在历史记录中留下登录页
        router.replace(redirect).catch(err => {
          console.error('路由跳转失败:', err)
          // 如果路由跳转失败，使用 window.location 强制跳转
          window.location.href = redirect
        })
      } else {
        ElMessage.error(response.message || '登录失败，请检查邮箱和密码')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查邮箱和密码')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(to right, #faf5ff, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px 32px;
  position: relative;
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 32px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-title {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #1e1b4b;
  margin-bottom: 8px;
  font-family: 'Space Grotesk', sans-serif;
}

.auth-subtitle {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(30, 27, 75, 0.3);
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

.auth-form {
  margin-bottom: 24px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.auth-form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: none;
}

.auth-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(99, 102, 241, 0.4);
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.auth-form :deep(.el-input__inner) {
  font-size: 14px;
  color: #1e1b4b;
}

.auth-form :deep(.el-input__inner::placeholder) {
  color: rgba(30, 27, 75, 0.4);
}

.auth-submit-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(120deg, #2563eb, #9333ea, #db2777, #ec4899);
  background-size: 200% 200%;
  border: none;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.3em;
  transition: all 0.3s;
  animation: gradientShift 3s ease infinite;
}

.auth-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

.auth-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.auth-link-text {
  font-size: 14px;
  color: rgba(30, 27, 75, 0.6);
  font-family: 'Inter', sans-serif;
}

.auth-link {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;
  margin-left: 8px;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.auth-link:hover {
  color: #9333ea;
  text-decoration: underline;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
