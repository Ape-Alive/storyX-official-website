<template>
  <div class="default-layout">
    <Navbar
      @start-click="handleStartClick"
      @logo-click="handleLogoClick"
    />
    <router-view />
    <!-- 登录弹窗（仅在首页显示） -->
    <AuthModal
      v-if="router.currentRoute.value.name === 'Home'"
      :visible="isAuthOpen"
      @close="closeAuthModal"
      @submit="handleAuthSubmit"
    />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'
import AuthModal from '@/components/AuthModal.vue'

const router = useRouter()
const isAuthOpen = ref(false)

// 提供登录弹窗状态给子组件使用
provide('isAuthOpen', isAuthOpen)
provide('openAuthModal', () => {
  isAuthOpen.value = true
})
provide('closeAuthModal', () => {
  isAuthOpen.value = false
})

const handleStartClick = () => {
  router.push('/pricing')
}

const handleLogoClick = () => {
  router.push('/')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleAuthSubmit = (data) => {
  ElMessage.success('登录成功！')
  console.log('登录数据:', data)
  isAuthOpen.value = false
}

const closeAuthModal = () => {
  isAuthOpen.value = false
}
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  position: relative;
}
</style>
