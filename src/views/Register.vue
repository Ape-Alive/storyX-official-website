<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">用户注册</h2>
          <p class="auth-subtitle">CREATE YOUR ACCOUNT</p>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="auth-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              type="email"
              placeholder="邮箱地址"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="设置密码（6-50个字符）"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="verificationCode">
            <div class="code-input-wrapper">
              <el-input
                v-model="registerForm.verificationCode"
                type="text"
                placeholder="6位验证码"
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
                <template v-if="codeCountdown > 0">
                  <span>{{ codeCountdown }}</span>秒后重试
                </template>
                <template v-else>
                  发送验证码
                </template>
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="auth-submit-btn"
              :loading="loading"
              @click="handleRegister"
            >
              注册账号
            </el-button>
          </el-form-item>
        </el-form>

        <div class="auth-footer">
          <span class="auth-link-text">已有账号？</span>
          <router-link to="/login" class="auth-link">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import { sendRegisterCode, register } from '@/api/auth'
import { setToken, setUserInfo } from '@/utils/storage'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const codeCountdown = ref(0)

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
  deviceFingerprint: '' // 可选，暂时留空
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateVerificationCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入验证码'))
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error('验证码必须是6位数字'))
  } else {
    callback()
  }
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度必须在6-50个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  verificationCode: [
    { validator: validateVerificationCode, trigger: 'blur' }
  ]
}

const handleCodeInput = (value) => {
  // 只允许输入数字
  registerForm.verificationCode = value.replace(/\D/g, '')
}

const handleSendCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  try {
    sendingCode.value = true
    const response = await sendRegisterCode(registerForm.email)

    if (response.success) {
      ElMessage.success('验证码已发送到您的邮箱，请查收')

      // 开始倒计时
      codeCountdown.value = 60
      const timer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '发送验证码失败，请稍后重试')
  } finally {
    sendingCode.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      const response = await register({
        email: registerForm.email,
        password: registerForm.password,
        verificationCode: registerForm.verificationCode,
        deviceFingerprint: registerForm.deviceFingerprint || undefined
      })

      if (response.success && response.data) {
        // 保存 token 和用户信息
        if (response.data.token) {
          setToken(response.data.token)
        }
        if (response.data.user) {
          setUserInfo(response.data.user)
        }

        ElMessage.success('注册成功！')

        // 跳转到仪表盘页面
        router.push('/dashboard/home')
      }
    } catch (error) {
      console.error('注册失败:', error)
      ElMessage.error(error.message || '注册失败，请检查输入信息')
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

.code-input-wrapper {
  display: flex;
  gap: 12px;
}

.code-input-wrapper :deep(.el-input) {
  flex: 1;
}

.send-code-btn {
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 9999px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #4f46e5;
  transition: all 0.5s;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  min-width: 140px;
  height: auto;
  letter-spacing: 0.05em;
}

.send-code-btn:hover:not(:disabled):not(.is-loading) {
  background: rgba(255, 255, 255, 0.7);
  color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
}

.send-code-btn.countdown-active {
  background: rgba(99, 102, 241, 0.1);
  color: rgba(99, 102, 241, 0.6);
  cursor: not-allowed;
}

.send-code-btn.countdown-active span {
  font-weight: 700;
  color: #4f46e5;
  font-size: 14px;
}

.send-code-btn:disabled {
  background: rgba(99, 102, 241, 0.1);
  color: rgba(99, 102, 241, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-code-btn.is-loading {
  background: rgba(255, 255, 255, 0.5);
  color: #4f46e5;
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
