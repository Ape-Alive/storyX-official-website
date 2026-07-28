<template>
  <div class="auth-layout">
    <router-link to="/" class="auth-back-home">
      <el-icon :size="16"><ArrowLeft /></el-icon>
      <span>返回首页</span>
    </router-link>
    <router-view />
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  position: relative;
}

.auth-back-home {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  color: #1e1b4b;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.auth-back-home:hover {
  background: #fff;
  color: #4f46e5;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.15);
}

@media (max-width: 960px) {
  .auth-back-home {
    top: 12px;
    left: 12px;
    padding: 7px 12px;
    font-size: 12px;
  }
}
</style>
