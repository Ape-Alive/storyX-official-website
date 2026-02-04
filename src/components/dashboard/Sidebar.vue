<template>
  <aside class="dashboard-sidebar">
    <!-- <div class="sidebar-header">
      <div class="logo-wrapper">
        <div class="logo-icon">
          <div class="logo-square"></div>
        </div>
        <span class="logo-text">
          STORY<span class="logo-x">X</span>
        </span>
      </div>
    </div> -->

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="item.path"
        :class="['nav-item', { active: isActive(item.path) }]"
      >
        <el-icon :size="20">
          <component :is="item.iconComponent" />
        </el-icon>
        <span>{{ item.label }}</span>
        <div v-if="isActive(item.path)" class="nav-indicator"></div>
      </router-link>
    </nav>

  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataBoard, TrendCharts, Box, CreditCard, Document, Message } from '@element-plus/icons-vue'

const route = useRoute()

const navItems = [
  { id: 'dashboard', label: '控制台首页', iconComponent: DataBoard, path: '/dashboard/home' },
  { id: 'usage', label: '使用监控', iconComponent: TrendCharts, path: '/dashboard/usage' },
  { id: 'plans', label: '套餐计划', iconComponent: Box, path: '/dashboard/plans' },
  { id: 'orders', label: '财务订单', iconComponent: CreditCard, path: '/dashboard/orders' },
  { id: 'docs', label: '开发者文档', iconComponent: Document, path: '/dashboard/docs' },
  { id: 'contact', label: '联系我们', iconComponent: Message, path: '/dashboard/contact' }
]

const isActive = (path) => {
  return route.path === path || (path === '/dashboard/home' && route.path === '/dashboard')
}
</script>

<style scoped>
.dashboard-sidebar {
  position: relative;
  width: 288px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  z-index: 50;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 96px);
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.sidebar-header {
  padding: 32px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: black;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-square {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 2px;
  transform: rotate(45deg);
}

.logo-text {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.02em;
  font-style: italic;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.logo-x {
  color: #9333ea;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  padding-top: 16px;
  min-height: 0;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  position: relative;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-hover);
  color: var(--text-primary);
  font-weight: 600;
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 4px;
  background: var(--accent-color);
  border-radius: 0 2px 2px 0;
}

</style>
