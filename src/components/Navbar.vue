<template>
  <header
    v-show="visible"
    class="site-header"
    :class="{ 'is-overlay': overlay, 'is-mobile': isMobile }"
  >
    <div class="site-header__inner">
      <button class="site-header__brand" type="button" @click="$emit('logo-click')">
        <img class="site-header__brand-mark" src="/icon.svg" alt="绘火AI" />
        <span class="site-header__brand-name">绘火AI</span>
      </button>

      <!-- 桌面端：顶部导航（扁平文字 + 下箭头） -->
      <nav v-if="!isMobile" class="site-header__nav" aria-label="站点导航">
        <router-link
          v-for="item in navItems"
          :key="item.id"
          :to="item.to"
          class="site-header__link"
          :class="{ 'is-active': item.isActive() }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="site-header__actions">
        <button
          type="button"
          class="site-header__download"
          :title="downloadInfo.label"
          @click="handleDownload"
        >
          {{ downloadInfo.shortLabel }}
          <span class="site-header__download-os">{{ osBadge }}</span>
        </button>
        <button
          v-if="showPrimary"
          class="site-header__primary"
          type="button"
          @click="$emit('primary-click')"
        >
          {{ primaryLabel }}
        </button>
      </div>
    </div>
  </header>

  <!-- 挂到 body，避免顶栏 backdrop-filter 把 fixed 吸到顶部 -->
  <Teleport to="body">
    <nav
      v-if="isMobile && visible"
      class="site-tabbar"
      :class="{ 'is-overlay': overlay }"
      aria-label="站点导航"
    >
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="item.to"
        class="site-tabbar__tab"
        :class="{ 'is-active': item.isActive() }"
      >
        <el-icon class="site-tabbar__icon" :size="20">
          <component :is="item.icon" />
        </el-icon>
        <span class="site-tabbar__label">{{ item.shortLabel }}</span>
      </router-link>
    </nav>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, Guide, Collection, Ticket } from '@element-plus/icons-vue'
import { getCurrentAppDownload } from '@/config/downloads'
import { isMobileDevice, useDevice } from '@/utils/device'

defineProps({
  overlay: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: true
  },
  primaryLabel: {
    type: String,
    default: '立即开启'
  },
  showPrimary: {
    type: Boolean,
    default: true
  }
})

defineEmits(['logo-click', 'primary-click'])

const route = useRoute()
const { isMobile } = useDevice()
const downloadInfo = getCurrentAppDownload()
const osBadge = computed(() => (downloadInfo.id === 'mac' ? 'Mac' : 'Win'))

const isHomeActive = () => route.path === '/' || route.name === 'Home'
const isWorkflowActive = () => route.path === '/workflow' || route.name === 'Workflow'
const isResourcesActive = () => route.path === '/resources' || route.name === 'Resources'
const isPricingActive = () => route.path === '/pricing' || route.name === 'Pricing'

const navItems = [
  {
    id: 'home',
    to: '/',
    label: '首页',
    shortLabel: '首页',
    icon: House,
    isActive: isHomeActive
  },
  {
    id: 'workflow',
    to: '/workflow',
    label: '制作流程',
    shortLabel: '流程',
    icon: Guide,
    isActive: isWorkflowActive
  },
  {
    id: 'resources',
    to: '/resources',
    label: '资源中心',
    shortLabel: '资源',
    icon: Collection,
    isActive: isResourcesActive
  },
  {
    id: 'pricing',
    to: '/pricing',
    label: '订阅方案',
    shortLabel: '订阅',
    icon: Ticket,
    isActive: isPricingActive
  }
]

const handleDownload = () => {
  if (isMobileDevice()) {
    ElMessage.warning('目前只支持桌面端（Windows / macOS），暂不支持移动端应用')
    return
  }
  if (!downloadInfo.url) {
    ElMessage.info(`${downloadInfo.label}即将上线，敬请期待`)
    return
  }
  window.open(downloadInfo.url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 18px 28px;
  pointer-events: none;
}

.site-header:not(.is-overlay) {
  background: rgba(243, 238, 230, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(28, 25, 23, 0.06);
}

/* 全宽三栏：左右贴边，中间菜单居中；缩放时左右始终靠边 */
.site-header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: none;
  margin: 0;
  pointer-events: none;
}

.site-header__inner > * {
  pointer-events: auto;
}

.site-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  justify-self: start;
  padding: 0;
}

.site-header__brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: contain;
  display: block;
}

.site-header__brand-name {
  font-family: 'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #1c1917;
}

.site-header.is-overlay .site-header__brand-name {
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.site-header__nav {
  display: inline-flex;
  align-items: center;
  justify-self: center;
  gap: 36px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

.site-header__link {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 0;
  padding: 6px 0;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: rgba(28, 25, 23, 0.72);
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.site-header.is-overlay .site-header__link {
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.25);
}

.site-header__link:hover {
  color: #1c1917;
}

.site-header.is-overlay .site-header__link:hover {
  color: #ffffff;
}

.site-header__link.is-active {
  color: #1c1917;
  background: transparent;
}

.site-header.is-overlay .site-header__link.is-active {
  color: #ffffff;
}

.site-header__actions {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.site-header__download {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 999px;
  padding: 14px 26px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #1c1917;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.site-header.is-overlay .site-header__download {
  color: #faf7f2;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.site-header__download:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.9);
}

.site-header.is-overlay .site-header__download:hover {
  background: rgba(255, 255, 255, 0.22);
}

.site-header__download-os {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
  letter-spacing: 0.04em;
}

.site-header__primary {
  border: 0;
  border-radius: 999px;
  padding: 12px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #faf7f2;
  background: #2f2a27;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.site-header__primary:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

/* 移动端底部 Tab（Teleport 到 body，相对视口固定） */
.site-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
  pointer-events: auto;
  background: rgba(250, 247, 242, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(28, 25, 23, 0.08);
  box-shadow: 0 -8px 28px rgba(28, 25, 23, 0.06);
}

.site-tabbar.is-overlay {
  background: rgba(20, 18, 16, 0.78);
  border-top-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.28);
}

.site-tabbar__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 52px;
  padding: 6px 4px;
  border-radius: 14px;
  text-decoration: none;
  color: rgba(28, 25, 23, 0.45);
  transition: color 0.2s ease, background 0.2s ease;
}

.site-tabbar.is-overlay .site-tabbar__tab {
  color: rgba(250, 247, 242, 0.5);
}

.site-tabbar__icon {
  display: flex;
}

.site-tabbar__label {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1;
}

.site-tabbar__tab.is-active {
  color: #1c1917;
  background: rgba(28, 25, 23, 0.06);
}

.site-tabbar.is-overlay .site-tabbar__tab.is-active {
  color: #faf7f2;
  background: rgba(255, 255, 255, 0.12);
}

.site-header.is-mobile {
  padding: 12px 16px;
}

.site-header.is-mobile:not(.is-overlay) {
  background: rgba(243, 238, 230, 0.72);
}

.site-header.is-mobile .site-header__inner {
  grid-template-columns: 1fr auto;
  grid-template-rows: auto;
  gap: 12px;
}

.site-header.is-mobile .site-header__brand-mark {
  width: 36px;
  height: 36px;
}

.site-header.is-mobile .site-header__brand-name {
  font-size: 22px;
}

.site-header.is-mobile .site-header__download {
  padding: 10px 16px;
  font-size: 13px;
}

.site-header.is-mobile .site-header__download-os,
.site-header.is-mobile .site-header__primary {
  display: none;
}
</style>
