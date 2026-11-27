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

          <el-form-item prop="activationCode">
            <el-input
              v-model="registerForm.activationCode"
              type="text"
              placeholder="激活码（选填，有则赠送对应套餐）"
              size="large"
              :prefix-icon="Ticket"
              clearable
              @input="handleActivationCodeInput"
            />
          </el-form-item>

          <el-form-item prop="inviteCode">
            <el-input
              v-model="registerForm.inviteCode"
              type="text"
              placeholder="邀请码（选填，好友邀请注册）"
              size="large"
              :prefix-icon="Ticket"
              clearable
              @input="handleInviteCodeInput"
            />
          </el-form-item>

          <el-form-item prop="verificationCode">
            <div class="code-input-wrapper">
              <el-input
                v-model="registerForm.verificationCode"
                type="text"
                placeholder="邮箱验证码（6位数字）"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, Key, Ticket } from '@element-plus/icons-vue'
import { sendRegisterCode, register } from '@/api/auth'
import { saveAuthTokens, setUserInfo } from '@/utils/storage'
import { promptSubscribePackage } from '@/utils/request'

const router = useRouter()
const route = useRoute()
const registerFormRef = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const codeCountdown = ref(0)

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  activationCode: '',
  inviteCode: '',
  verificationCode: '',
  deviceFingerprint: '' // 可选，暂时留空
})

onMounted(() => {
  const fromQuery = route.query.invite || route.query.inviteCode
  if (fromQuery) {
    registerForm.inviteCode = String(fromQuery).toUpperCase().replace(/\s+/g, '')
  }
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
  activationCode: [],
  verificationCode: [
    { validator: validateVerificationCode, trigger: 'blur' }
  ]
}

const handleActivationCodeInput = (value) => {
  registerForm.activationCode = String(value || '').toUpperCase().replace(/\s+/g, '')
}

function handleInviteCodeInput(value) {
  registerForm.inviteCode = String(value || '').toUpperCase().replace(/\s+/g, '')
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
      const payload = {
        email: registerForm.email,
        password: registerForm.password,
        verificationCode: registerForm.verificationCode,
        deviceFingerprint: registerForm.deviceFingerprint || undefined
      }
      if (registerForm.activationCode?.trim()) {
        payload.activationCode = registerForm.activationCode.trim()
      }
      if (registerForm.inviteCode?.trim()) {
        payload.inviteCode = registerForm.inviteCode.trim()
      }
      const response = await register(payload)

      if (response.success && response.data) {
        saveAuthTokens(response.data)
        if (response.data.user) {
          setUserInfo(response.data.user)
        }

        ElMessage.success('注册成功！')

        const entitlement = response.data.entitlement
        if (entitlement && entitlement.hasAccess === false) {
          await router.push('/dashboard/plans').catch(() => {
            window.location.href = '/dashboard/plans'
          })
          promptSubscribePackage(entitlement.message, entitlement.subscriptionGuide, {
            force: true
          })
          return
        }

        router.push('/dashboard/usage')
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
  font-family: 'Inter', sans-serif;
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

.send-code-btn.countdown-active span {
  font-weight: 700;
  color: #111;
  font-size: 13px;
}

.send-code-btn.is-loading {
  background: #111 !important;
  border-color: #111 !important;
  color: #fff !important;
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

  .send-code-btn {
    min-width: 96px;
    padding: 0 10px;
    font-size: 12px;
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
