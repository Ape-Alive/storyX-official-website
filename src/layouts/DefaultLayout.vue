<template>
  <div class="default-layout" :class="{ 'is-home': isHome, 'is-chrome-hidden': hideChrome }">
    <Navbar
      :visible="!hideChrome"
      :overlay="isHome"
      :show-primary="true"
      :primary-label="primaryLabel"
      @logo-click="handleLogoClick"
      @primary-click="handlePrimaryClick"
    />
    <router-view />
    <AuthModal
      v-if="isHome"
      :visible="isAuthOpen"
      @close="closeAuthModal"
      @submit="handleAuthSubmit"
    />
  </div>
</template>

<script setup>
import { computed, ref, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'
import AuthModal from '@/components/AuthModal.vue'
import { useUserStore } from '@/stores'
import { getToken } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isHome = computed(() => route.name === 'Home')
const isLoggedIn = computed(() => !!userStore.token || !!getToken())
const primaryLabel = computed(() => (isLoggedIn.value ? '控制台' : '登录'))
const isAuthOpen = ref(false)
/** 首页加载特效期间隐藏顶栏（进入首页先藏，避免闪一下） */
const hideChrome = ref(route.name === 'Home')

watch(isHome, (home) => {
  if (!home) hideChrome.value = false
  else hideChrome.value = true
})

provide('setHomeChromeHidden', (hidden) => {
  hideChrome.value = !!hidden
})
provide('isAuthOpen', isAuthOpen)
provide('openAuthModal', () => {
  isAuthOpen.value = true
})
provide('closeAuthModal', () => {
  isAuthOpen.value = false
})

const handlePrimaryClick = () => {
  if (!isLoggedIn.value) {
    router.push({ path: '/auth/login', query: { redirect: '/dashboard/usage' } })
    return
  }
  router.push('/dashboard/usage')
}

const handleLogoClick = () => {
  if (isHome.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  router.push('/')
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
