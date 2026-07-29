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
            />
          </el-form-item>

          <el-form-item prop="captchaCode">
            <div class="captcha-field">
              <el-input
                v-model="loginForm.captchaCode"
                class="captcha-input"
                placeholder="验证码"
                size="large"
                :prefix-icon="Key"
                maxlength="4"
                clearable
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                class="captcha-image-btn"
                title="点击刷新"
                @click="refreshCaptcha"
              >
                <img v-if="captchaImageUrl" :src="captchaImageUrl" alt="验证码" />
                <span v-else class="captcha-loading">刷新</span>
              </button>
            </div>
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
          <router-link to="/auth/forgot-password" class="forgot-link">忘记密码？</router-link>
          <span class="auth-footer-sep">·</span>
          <span class="auth-link-text">还没有账号？</span>
          <router-link to="/register" class="auth-link">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import { login, getCaptcha } from '@/api/auth'
import { saveAuthTokens, setUserInfo } from '@/utils/storage'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)
const captchaImageUrl = ref('')

const loginForm = reactive({
  email: '',
  password: '',
  captchaCode: '',
  sessionId: '',
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
  ],
  captchaCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为4位', trigger: 'blur' }
  ]
}

const refreshCaptcha = async () => {
  try {
    captchaImageUrl.value = ''
    loginForm.captchaCode = ''
    const response = await getCaptcha()
    if (response.success && response.data) {
      captchaImageUrl.value = response.data.imageUrl
      loginForm.sessionId = response.data.sessionId
    } else {
      ElMessage.error(response.message || '获取验证码失败')
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error(error.message || '获取验证码失败')
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!loginForm.sessionId) {
      ElMessage.error('验证码已失效，请刷新')
      await refreshCaptcha()
      return
    }

    try {
      loading.value = true
      const response = await login({
        email: loginForm.email,
        password: loginForm.password,
        captchaCode: loginForm.captchaCode,
        sessionId: loginForm.sessionId,
        deviceFingerprint: loginForm.deviceFingerprint || undefined
      })

      if (response.success && response.data) {
        saveAuthTokens(response.data)
        if (response.data.user) {
          setUserInfo(response.data.user)
        }

        ElMessage.success('登录成功！')

        const redirect = router.currentRoute.value.query.redirect || '/dashboard/usage'
        router.replace(redirect).catch(() => {
          window.location.href = redirect
        })
      } else {
        ElMessage.error(response.message || '登录失败，请检查邮箱和密码')
        await refreshCaptcha()
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查邮箱和密码')
      await refreshCaptcha()
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  refreshCaptcha()
})
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

.forgot-link {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
}

.forgot-link:hover {
  color: #9333ea;
  text-decoration: underline;
}

.auth-footer-sep {
  margin: 0 6px;
  color: rgba(30, 27, 75, 0.25);
}

.captcha-field {
  width: 100%;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 48px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.captcha-field:focus-within {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.captcha-field:hover:not(:focus-within) {
  border-color: rgba(99, 102, 241, 0.4);
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-field :deep(.el-input__wrapper) {
  height: 100%;
  min-height: 48px;
  padding: 0 12px 0 16px;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.captcha-field :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}

.captcha-image-btn {
  position: relative;
  flex-shrink: 0;
  width: 118px;
  margin: 4px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-image-btn::after {
  content: '点击刷新';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(30, 27, 75, 0.45);
  opacity: 0;
  transition: opacity 0.2s;
}

.captcha-image-btn:hover::after {
  opacity: 1;
}

.captcha-image-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-loading {
  font-size: 12px;
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

@media (max-width: 960px) {
  .auth-page {
    padding: 72px 20px 24px;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .auth-card {
    background: transparent;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .auth-header {
    margin-bottom: 28px;
  }

  .auth-title {
    font-size: 22px;
    letter-spacing: 0.25em;
  }

  .auth-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .auth-form :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.92);
  }

  .captcha-field {
    background: rgba(255, 255, 255, 0.92);
  }

  .captcha-image-btn {
    width: 108px;
  }

  .captcha-image-btn::after {
    content: '刷新';
  }

  .auth-footer {
    border-top-color: rgba(99, 102, 241, 0.12);
  }
}
</style>
