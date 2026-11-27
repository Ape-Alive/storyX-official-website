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
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 24px 24px;
  position: relative;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 28px 24px 24px;
  box-shadow: none;
}

.auth-header {
  text-align: center;
  margin-bottom: 20px;
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
  margin-bottom: 12px;
}

.auth-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
  margin-top: 4px;
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

.code-input-wrapper {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: stretch;
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

.send-code-btn {
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  padding: 0 14px;
  height: 40px;
  min-width: 108px;
  border-radius: 8px;
  border: 1px solid #111 !important;
  background: #111 !important;
  color: #fff !important;
  transition: background 0.15s, border-color 0.15s;
}

.send-code-btn:hover:not(:disabled):not(.is-loading) {
  background: #000 !important;
  border-color: #000 !important;
  color: #fff !important;
}

.send-code-btn.countdown-active,
.send-code-btn:disabled {
  background: #f0f0f0 !important;
  border-color: #e0e0e0 !important;
  color: rgba(17, 17, 17, 0.4) !important;
  cursor: not-allowed;
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
    padding: 64px 16px 20px;
    align-items: flex-start;
  }

  .auth-container {
    max-width: 100%;
  }

  .auth-card {
    border: none;
    border-radius: 0;
    padding: 8px 0 0;
    background: transparent;
  }

  .auth-header {
    margin-bottom: 16px;
  }

  .auth-title {
    font-size: 20px;
    letter-spacing: 0.16em;
  }

  .auth-form :deep(.el-form-item) {
    margin-bottom: 10px;
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

  .send-code-btn {
    min-width: 96px;
    padding: 0 10px;
    height: 40px;
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
    padding: 56px 14px 16px;
  }

  .auth-title {
    font-size: 18px;
    letter-spacing: 0.12em;
  }

  .auth-link-text,
  .auth-link {
    font-size: 12px;
  }
}
</style>
