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
  top: 16px;
  left: 16px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(17, 17, 17, 0.12);
  box-shadow: none;
  color: rgba(17, 17, 17, 0.58);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.auth-back-home:hover {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(17, 17, 17, 0.22);
  color: #111;
}

@media (max-width: 960px) {
  .auth-back-home {
    top: 10px;
    left: 10px;
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
