<template>
  <div
    v-if="visible"
    class="auth-modal-overlay"
    @click="$emit('close')"
    @wheel.prevent="handleOverlayWheel"
    @touchmove.prevent="handleOverlayTouchMove"
  >
    <div class="auth-modal" @click.stop>
      <div class="auth-modal-top-bar"></div>
      <div class="auth-modal-header">
        <h2 class="auth-modal-title">身份认证</h2>
        <p class="auth-modal-subtitle">ACCESS YOUR STUDIO</p>
      </div>
      <div class="auth-modal-body">
        <input
          v-model="email"
          type="email"
          placeholder="邮箱账号"
          class="auth-input"
        />
        <input
          v-model="password"
          type="password"
          placeholder="访问密码"
          class="auth-input"
        />
        <button class="auth-submit-btn" @click="handleSubmit">
          登录工作台
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const email = ref('')
const password = ref('')

// 阻止背景滚动
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 保存当前滚动位置
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  } else {
    // 恢复滚动
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }
})

// 组件卸载时确保恢复滚动
onUnmounted(() => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
})

const handleSubmit = () => {
  if (!email.value || !password.value) {
    ElMessage.warning('请填写完整信息')
    return
  }
  emit('submit', { email: email.value, password: password.value })
  emit('close')
}

// 阻止遮罩层的滚动事件
const handleOverlayWheel = (e) => {
  e.preventDefault()
}

const handleOverlayTouchMove = (e) => {
  e.preventDefault()
}
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
  touch-action: none;
  -webkit-overflow-scrolling: none;
}

.auth-modal-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.auth-modal {
  position: relative;
  background: #0a0a0c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 384px;
  max-height: 90vh;
  border-radius: 48px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: zoomIn 0.3s ease-out;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.auth-modal-top-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 4px;
  background: linear-gradient(to right, #3b82f6, #a855f7, #ec4899);
  filter: blur(4px);
}

.auth-modal-header {
  text-align: center;
  margin-bottom: 48px;
}

.auth-modal-title {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: white;
  margin-bottom: 8px;
}

.auth-modal-subtitle {
  color: rgba(255, 255, 255, 0.2);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.auth-modal-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.auth-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: white;
  outline: none;
  transition: border-color 0.3s;
}

.auth-input::placeholder {
  color: rgba(255, 255, 255, 0.1);
}

.auth-input:focus {
  border-bottom-color: #a855f7;
}

.auth-submit-btn {
  width: 100%;
  background: linear-gradient(to right, #2563eb, #9333ea, #db2777);
  color: white;
  font-weight: 900;
  padding: 16px;
  border-radius: 9999px;
  font-size: 11px;
  letter-spacing: 0.4em;
  margin-top: 24px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-submit-btn:hover {
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
}

.auth-submit-btn:active {
  transform: scale(0.95);
}
</style>
