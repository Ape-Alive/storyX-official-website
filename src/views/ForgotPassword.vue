<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">找回密码</h2>
          <p class="auth-subtitle">RESET YOUR PASSWORD</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="auth-form"
          @submit.prevent="handleSubmit"
        >
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="注册邮箱"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item prop="verificationCode">
            <div class="code-input-wrapper">
              <el-input
                v-model="form.verificationCode"
                placeholder="邮箱验证码"
                size="large"
                :prefix-icon="Key"
                maxlength="6"
                clearable
                @input="handleCodeInput"
              />
              <el-button
                :disabled="codeCountdown > 0 || sendingCode"
                :loading="sendingCode"
                :class="['send-code-btn', { 'countdown-active': codeCountdown > 0 }]"
                @click="handleSendCode"
              >
                <template v-if="codeCountdown > 0">{{ codeCountdown }}秒后重试</template>
                <template v-else>发送验证码</template>
              </el-button>
            </div>
          </el-form-item>

          <el-form-item prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="新密码（6-50个字符）"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认新密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleSubmit"
            />
          </el-form-item>

          <el-form-item prop="captchaCode">
            <div class="captcha-field">
              <el-input
                v-model="form.captchaCode"
                class="captcha-input"
                placeholder="图形验证码"
                size="large"
                :prefix-icon="Key"
                maxlength="4"
                clearable
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
              @click="handleSubmit"
            >
              重置密码
            </el-button>
          </el-form-item>
        </el-form>

        <div class="auth-footer">
          <span class="auth-link-text">想起密码了？</span>
          <router-link to="/login" class="auth-link">返回登录</router-link>
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
import { sendResetPasswordCode, resetPassword, getCaptcha } from '@/api/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const codeCountdown = ref(0)
const captchaImageUrl = ref('')

const form = reactive({
  email: '',
  captchaCode: '',
  sessionId: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  captchaCode: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    { len: 4, message: '图形验证码为4位', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度必须在6-50个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleCodeInput = (value) => {
  form.verificationCode = String(value || '').replace(/\D/g, '')
}

const refreshCaptcha = async () => {
  try {
    captchaImageUrl.value = ''
    form.captchaCode = ''
    const response = await getCaptcha()
    if (response.success && response.data) {
      captchaImageUrl.value = response.data.imageUrl
      form.sessionId = response.data.sessionId
    }
  } catch (error) {
    ElMessage.error(error.message || '获取图形验证码失败')
  }
}

const handleSendCode = async () => {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  if (!form.captchaCode || form.captchaCode.length !== 4 || !form.sessionId) {
    ElMessage.warning('请先填写图形验证码')
    return
  }

  try {
    sendingCode.value = true
    const response = await sendResetPasswordCode(form.email, form.captchaCode, form.sessionId)
    if (response.success) {
      ElMessage.success(response.message || response.data?.message || '若该邮箱已注册，验证码将发送至邮箱')
      codeCountdown.value = 60
      const timer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) clearInterval(timer)
      }, 1000)
      await refreshCaptcha()
    }
  } catch (error) {
    ElMessage.error(error.message || '发送验证码失败，请稍后重试')
    await refreshCaptcha()
  } finally {
    sendingCode.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      loading.value = true
      const response = await resetPassword({
        email: form.email,
        verificationCode: form.verificationCode,
        newPassword: form.newPassword
      })
      if (response.success) {
        ElMessage.success('密码重置成功，请使用新密码登录')
        router.replace('/auth/login')
      } else {
        ElMessage.error(response.message || '重置失败，请重试')
      }
    } catch (error) {
      ElMessage.error(error.message || '重置失败，请检查验证码与密码')
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

.code-input-wrapper {
  width: 100%;
  display: flex;
  gap: 10px;
}

.code-input-wrapper :deep(.el-input) {
  flex: 1;
  min-width: 0;
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

.send-code-btn {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  padding: 0 16px;
  height: 48px;
  border-radius: 9999px;
  border: none;
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.send-code-btn.countdown-active {
  background: rgba(99, 102, 241, 0.1);
  color: rgba(99, 102, 241, 0.6);
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
  animation: gradientShift 3s ease infinite;
}

.auth-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.auth-link-text {
  font-size: 14px;
  color: rgba(30, 27, 75, 0.6);
}

.auth-link {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;
  margin-left: 8px;
}

.auth-link:hover {
  color: #9333ea;
  text-decoration: underline;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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

  .send-code-btn {
    min-width: 108px;
    padding: 0 12px;
    height: 40px;
  }

  .code-input-wrapper :deep(.el-input__wrapper) {
    min-height: 40px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
