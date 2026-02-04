<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- 品牌 Logo -->
      <div class="navbar-brand" @click="$emit('logo-click')">
        <div class="logo-wrapper">
          <div class="logo-glow"></div>
          <div class="logo-icon">
            <el-icon :size="20" color="#000">
              <Film />
            </el-icon>
          </div>
        </div>
        <span class="brand-text">
          STORY<span class="brand-text-purple">X</span>
        </span>
      </div>

      <!-- 导航菜单 -->
      <div class="navbar-menu">
        <router-link to="/" class="menu-item" :class="{ active: isHomeActive }">首页</router-link>
        <router-link to="/workflow" class="menu-item" :class="{ active: isWorkflowActive }">制作流程</router-link>
        <a href="#platform" class="menu-item">模型矩阵</a>
        <router-link to="/pricing" class="menu-item" :class="{ active: isPricingActive }">订阅方案</router-link>
      </div>

      <!-- 按钮区域 -->
      <div class="navbar-actions">
        <a href="/auth/login" target="_blank" class="login-btn">
          用户登录
        </a>
        <button class="primary-btn" @click="$emit('start-click')">
          <span>立即开启</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { Film } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

defineEmits(['logo-click', 'start-click'])

// 判断当前路由是否为首页
const isHomeActive = computed(() => {
  return route.path === '/' || route.name === 'Home'
})

// 判断当前路由是否为制作流程页
const isWorkflowActive = computed(() => {
  return route.path === '/workflow' || route.name === 'Workflow'
})

// 判断当前路由是否为定价页
const isPricingActive = computed(() => {
  return route.path === '/pricing' || route.name === 'Pricing'
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.navbar-brand:hover .logo-glow {
  opacity: 1;
}

.navbar-brand:hover .logo-icon {
  transform: rotate(6deg) scale(1.05);
}

.logo-wrapper {
  position: relative;
}

.logo-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, #3b82f6, #a855f7, #ec4899);
  filter: blur(8px);
  opacity: 0.4;
  transition: opacity 0.3s;
  border-radius: 12px;
}

.logo-icon {
  position: relative;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.brand-text {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s;
  animation: fadeIn 0.6s ease-out;
}

.brand-text:hover {
  transform: scale(1.05);
}

.brand-text-purple {
  color: #a855f7;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  transition: text-shadow 0.3s;
}

.brand-text:hover .brand-text-purple {
  text-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
}

.navbar-menu {
  display: none;
  align-items: center;
  gap: 48px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

@media (min-width: 768px) {
  .navbar-menu {
    display: flex;
  }
}

.menu-item {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
  padding: 8px 0;
}

.menu-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #3b82f6, #a855f7, #ec4899);
  transition: width 0.3s;
}

.menu-item:hover {
  color: white;
  transform: translateY(-2px);
}

.menu-item:hover::after {
  width: 100%;
}

.menu-item.active {
  color: white;
}

.menu-item.active::after {
  width: 100%;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 32px;
}

.login-btn {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
  display: inline-block;
}

.login-btn:hover {
  color: white;
  transform: translateY(-2px);
}

.primary-btn {
  position: relative;
  overflow: hidden;
  background: white;
  color: black;
  padding: 14px 40px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
}

.primary-btn:hover {
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
  transform: translateY(-2px) scale(1.05);
}

.primary-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #bfdbfe, #e9d5ff);
  opacity: 0;
  transition: opacity 0.3s;
}

.primary-btn:hover::before {
  opacity: 1;
}

.primary-btn span {
  position: relative;
  z-index: 10;
}
</style>
