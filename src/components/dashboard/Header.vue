<template>
  <header class="dashboard-header">
    <div class="header-content">
      <button class="logo-wrapper" type="button" @click="goHome">
        <img class="logo-icon" src="/icon.svg" alt="绘火AI" />
        <span class="logo-text">绘火AI</span>
      </button>
      <!-- <h1 class="header-title">控制台</h1> -->
      <div class="header-right">
        <el-dropdown @command="handleCommand" trigger="click" placement="bottom-end">
          <div class="user-avatar-wrapper">
            <div class="user-avatar">
              {{ userInitials }}
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-menu">
              <div class="user-info-section">
                <div class="user-name">{{ userName || '用户' }}</div>
                <div class="user-email">{{ userEmail || 'user@example.com' }}</div>
              </div>
              <el-dropdown-item divided command="theme">
                <div class="dropdown-item-content">
                  <span>主题</span>
                  <div class="dropdown-item-right">
                    <span class="theme-value">{{ themeLabel }}</span>
                    <el-icon :size="14"><ArrowRight /></el-icon>
                  </div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item command="download">
                <div class="dropdown-item-content">
                  <span>下载 桌面程序</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <div class="dropdown-item-content">
                  <span>退出登录</span>
                  <el-icon :size="14"><SwitchButton /></el-icon>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, SwitchButton } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/modules/theme'
import {
  getCurrentAppDownload,
  getCurrentAppDownloadAsync,
} from '@/config/downloads'
import { isMobileDevice } from '@/utils/device'

const props = defineProps({
  userEmail: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['logout'])

const router = useRouter()
const themeStore = useThemeStore()
const downloadInfo = ref(getCurrentAppDownload())

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  getCurrentAppDownloadAsync().then((info) => {
    downloadInfo.value = info
  })
})

const userInitials = computed(() => {
  if (props.userEmail) {
    const parts = props.userEmail.split('@')
    if (parts[0]) {
      return parts[0].substring(0, 2).toUpperCase()
    }
  }
  return 'U'
})

const themeLabel = computed(() => {
  return themeStore.theme === 'dark' ? '深色' : '浅色'
})

const handleDownload = () => {
  if (isMobileDevice()) {
    ElMessage.warning('请在电脑端打开网站下载桌面程序')
    return
  }
  const info = downloadInfo.value
  if (!info.url || info.available === false) {
    ElMessage.info(`${info.label}即将上线，敬请期待`)
    return
  }
  window.open(info.url, '_blank', 'noopener,noreferrer')
}

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'theme') {
    themeStore.toggleTheme()
  } else if (command === 'download') {
    handleDownload()
  }
}

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.dashboard-header {
  height: 64px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  gap: 24px;
}

@media (max-width: 960px) {
  .dashboard-header {
    height: 56px;
  }

  .header-content {
    padding: 0 16px;
    gap: 12px;
  }

  .logo-text {
    font-size: 18px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
  display: block;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}

.logo-x {
  color: #9333ea;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  flex: 1;
  text-align: center;
  transition: color 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-avatar-wrapper {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s;
}

.user-avatar-wrapper:hover {
  background: var(--bg-tertiary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-dropdown-menu {
  min-width: 280px;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background: var(--bg-secondary);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item) {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s;
  background: var(--bg-secondary);
}

.user-dropdown-menu :deep(.el-dropdown-menu__item:hover) {
  background: var(--bg-hover);
}

.user-dropdown-menu :deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid var(--border-color);
  margin-top: 4px;
}

.user-info-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.user-email {
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: 'Inter', sans-serif;
}

.dropdown-item-right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.theme-value {
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}
</style>
