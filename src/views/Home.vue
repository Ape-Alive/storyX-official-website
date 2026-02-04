<template>
  <div class="home-page">
    <AuthModal
      :visible="isAuthOpen"
      @close="isAuthOpen = false"
      @submit="handleAuthSubmit"
    />

    <main style="position: relative; z-index: 10;">
      <HeroSection @download-click="handleDownloadClick" />
      <PreviewSection @play-click="handlePlayClick" />
      <CtaSection
        @cta-click="handleCtaClick"
        @custom-click="handleCustomClick"
      />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import HeroSection from '@/components/HeroSection.vue'
import PreviewSection from '@/components/PreviewSection.vue'
import CtaSection from '@/components/CtaSection.vue'
import Footer from '@/components/Footer.vue'

const router = useRouter()

onMounted(() => {
  console.log('Home page mounted')
})

const handleDownloadClick = () => {
  ElMessage.info('下载功能开发中...')
}

const handlePlayClick = () => {
  ElMessage.info('视频播放功能开发中...')
}

const handleCtaClick = () => {
  router.push('/pricing')
}

const handleCustomClick = () => {
  router.push('/pricing')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(to right, #faf5ff, #ffffff);
  color: #1e1b4b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* 背景装饰 */
.home-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
  background-size: 100% 100%;
}

.home-page::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.25;
  background-image: radial-gradient(rgba(156, 163, 175, 0.3) 1px, transparent 0);
  background-size: 64px 64px;
  mix-blend-mode: multiply;
}
</style>
