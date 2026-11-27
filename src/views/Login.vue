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
import { promptSubscribePackage } from '@/utils/request'
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

        const entitlement = response.data.entitlement
        if (entitlement && entitlement.hasAccess === false) {
          await router.replace('/dashboard/plans').catch(() => {
            window.location.href = '/dashboard/plans'
          })
          promptSubscribePackage(entitlement.message, entitlement.subscriptionGuide, {
            force: true
          })
          return
        }

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
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 24px 24px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 55% at 12% 18%, rgba(28, 25, 23, 0.07), transparent 58%),
    radial-gradient(ellipse 65% 50% at 88% 82%, rgba(87, 83, 78, 0.09), transparent 55%),
    linear-gradient(165deg, #f8f7f5 0%, #efeeec 48%, #f4f3f1 100%);
}

.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(17, 17, 17, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(17, 17, 17, 0.035) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 75%);
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 12px;
  padding: 28px 24px 24px;
  box-shadow: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-title {
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #111;
  margin: 0 0 4px;
  font-family: 'Space Grotesk', sans-serif;
}

.auth-subtitle {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(17, 17, 17, 0.4);
  text-transform: uppercase;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.auth-form {
  margin-bottom: 0;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.auth-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
  margin-top: 12px;
}

.auth-form :deep(.el-form-item__error) {
  padding-top: 2px;
}

.auth-form :deep(.el-input__wrapper) {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: none;
  min-height: 40px;
}

.auth-form :deep(.el-input__wrapper:hover) {
  border-color: #999;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  border-color: #111;
  box-shadow: none;
}

.auth-form :deep(.el-input__inner) {
  font-size: 14px;
  color: #111;
  height: 24px;
  line-height: 24px;
}

.auth-form :deep(.el-input__inner::placeholder) {
  color: rgba(17, 17, 17, 0.35);
}

.forgot-link {
  font-size: 13px;
  font-weight: 500;
  color: #111;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
}

.forgot-link:hover {
  text-decoration: underline;
}

.auth-footer-sep {
  margin: 0 6px;
  color: rgba(17, 17, 17, 0.25);
}

.captcha-field {
  width: 100%;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 40px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.captcha-field:focus-within {
  border-color: #111;
}

.captcha-field:hover:not(:focus-within) {
  border-color: #999;
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-field :deep(.el-input__wrapper) {
  height: 100%;
  min-height: 40px;
  padding: 0 10px 0 12px;
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
  width: 100px;
  margin: 3px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
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
  background: rgba(0, 0, 0, 0.55);
  opacity: 0;
  transition: opacity 0.15s;
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
  color: rgba(17, 17, 17, 0.4);
}

.auth-submit-btn {
  width: 100%;
  height: 42px;
  background: #111 !important;
  border: 1px solid #111 !important;
  border-radius: 8px;
  color: #fff !important;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.12em;
  transition: background 0.15s, border-color 0.15s;
}

.auth-submit-btn:hover,
.auth-submit-btn:focus {
  background: #000 !important;
  border-color: #000 !important;
  color: #fff !important;
}

.auth-submit-btn:active {
  background: #222 !important;
}

.auth-footer {
  text-align: center;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #eee;
}

.auth-link-text {
  font-size: 13px;
  color: rgba(17, 17, 17, 0.55);
  font-family: 'Inter', sans-serif;
}

.auth-link {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  text-decoration: none;
  margin-left: 6px;
  font-family: 'Inter', sans-serif;
}

.auth-link:hover {
  text-decoration: underline;
}

@media (max-width: 960px) {
  .auth-page {
    padding: max(96px, 18vh) 16px 48px;
    align-items: flex-start;
    justify-content: center;
  }

  .auth-container {
    max-width: 100%;
    margin-top: min(8vh, 56px);
  }

  .auth-card {
    border: none;
    border-radius: 0;
    padding: 8px 0 0;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .auth-header {
    margin-bottom: 24px;
  }

  .auth-title {
    font-size: 20px;
    letter-spacing: 0.16em;
  }

  .auth-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .auth-form :deep(.el-input__wrapper) {
    background: #fff;
  }

  .captcha-field {
    background: #fff;
  }

  .captcha-image-btn {
    width: 92px;
  }

  .captcha-image-btn::after {
    content: '刷新';
  }

  .auth-submit-btn {
    height: 40px;
    letter-spacing: 0.08em;
  }

  .auth-footer {
    padding-top: 14px;
    margin-top: 14px;
  }
}

@media (max-width: 480px) {
  .auth-page {
    padding: max(88px, 16vh) 14px 40px;
  }

  .auth-container {
    margin-top: min(10vh, 64px);
  }

  .auth-title {
    font-size: 18px;
    letter-spacing: 0.12em;
  }

  .auth-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2px 0;
    font-size: 12px;
  }

  .forgot-link,
  .auth-link-text,
  .auth-link {
    font-size: 12px;
  }
}
</style>
