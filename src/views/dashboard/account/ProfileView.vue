<template>
  <div class="profile-view" :class="{ 'is-mobile': isMobile }">
    <header class="profile-header">
      <h2 class="profile-title">个人信息</h2>
      <p v-if="!isMobile" class="profile-desc">账号基础资料（当前为登录态展示）</p>
    </header>

    <div class="profile-card">
      <div class="profile-avatar">{{ userInitials }}</div>
      <div class="profile-fields">
        <div class="field">
          <div class="field-label">用户名</div>
          <div class="field-value">{{ displayName }}</div>
        </div>
        <div class="field">
          <div class="field-label">电子邮箱</div>
          <div class="field-value">{{ displayEmail }}</div>
        </div>
        <div v-if="userId" class="field">
          <div class="field-label">用户 ID</div>
          <div class="field-value field-value--mono">
            <span>{{ userIdRevealed ? userId : maskedUserId }}</span>
            <button type="button" class="icon-btn" @click="userIdRevealed = !userIdRevealed">
              {{ userIdRevealed ? '隐藏' : '显示' }}
            </button>
            <button type="button" class="icon-btn" @click="copyUserId">复制</button>
          </div>
        </div>
        <div v-if="createdAt" class="field">
          <div class="field-label">注册时间</div>
          <div class="field-value">{{ formatDateTime(createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { showSuccessToast, showFailToast } from 'vant'
import { getUserInfo } from '@/utils/storage'
import { useDevice } from '@/utils/device'

const { isMobile } = useDevice()
const user = computed(() => getUserInfo() || {})
const userIdRevealed = ref(false)

const displayEmail = computed(() => user.value.email || '—')
const displayName = computed(() => {
  if (user.value.name) return user.value.name
  const email = user.value.email || ''
  return email.split('@')[0] || '—'
})
const userId = computed(() => user.value.id || user.value.userId || '')
const createdAt = computed(() => user.value.createdAt || '')
const userInitials = computed(() => {
  const email = user.value.email || 'U'
  return email.split('@')[0].substring(0, 2).toUpperCase() || 'U'
})
const maskedUserId = computed(() => {
  const id = userId.value
  if (!id || id.length < 8) return '••••••••'
  return `${id.slice(0, 4)}••••${id.slice(-4)}`
})

const formatDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const notifySuccess = (msg) => {
  if (isMobile.value) showSuccessToast(msg)
  else ElMessage.success(msg)
}

const copyUserId = async () => {
  if (!userId.value) return
  try {
    await navigator.clipboard.writeText(userId.value)
    notifySuccess('已复制用户 ID')
  } catch {
    if (isMobile.value) showFailToast('复制失败')
    else ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.profile-view {
  color: #1c1917;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.profile-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(28, 25, 23, 0.55);
}

.profile-card {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 20px 0;
  border-top: 1px solid rgba(28, 25, 23, 0.08);
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-label {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(28, 25, 23, 0.45);
}

.field-value {
  font-size: 15px;
  font-weight: 650;
  word-break: break-all;
}

.field-value--mono {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
}

.icon-btn {
  border: 1px solid rgba(28, 25, 23, 0.12);
  border-radius: 6px;
  background: rgba(28, 25, 23, 0.04);
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  color: rgba(28, 25, 23, 0.7);
}

.profile-view.is-mobile .profile-title {
  font-size: 18px;
}

.profile-view.is-mobile .profile-card {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-view.is-mobile .field-value--mono {
  justify-content: center;
}
</style>
