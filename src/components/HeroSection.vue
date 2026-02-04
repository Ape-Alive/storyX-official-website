<template>
  <section class="hero-section">
    <div class="hero-container">
      <Badge>
        <el-icon :size="12" color="#60a5fa" style="margin-right: 8px;">
          <Star />
        </el-icon>
        聚合全球顶尖 AI 模型矩阵
      </Badge>

      <h1 class="hero-title">
        导演你的<br />
        <span class="hero-title-gradient">想象力</span>
      </h1>

      <p class="hero-desc">
        StoryX 集成 DeepSeek 逻辑引擎与 Luma 视听模型，<br/>
        让剧本创作、选角、拍摄到后期剪辑，在指尖瞬间完成。
      </p>

      <div class="hero-actions">
        <button class="hero-primary-btn" @click="$emit('download-click')">
          <span class="btn-content">
            下载桌面制片厂
            <el-icon :size="20">
              <Download />
            </el-icon>
          </span>
        </button>
        <div class="hero-platforms">
          <div class="platform-item">
            <el-icon :size="18">
              <Monitor />
            </el-icon>
            macOS
          </div>
          <div class="platform-item">
            <el-icon :size="18">
              <Iphone />
            </el-icon>
            Windows
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Badge from './Badge.vue'
import { Star, Download, Monitor, Iphone } from '@element-plus/icons-vue'

defineEmits(['download-click'])
</script>

<style scoped>
.hero-section {
  position: relative;
  padding-top: 180px;
  padding-bottom: 192px;
  padding-left: 32px;
  padding-right: 32px;
  z-index: 10;
}

.hero-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-title {
  font-size: 80px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 56px;
  line-height: 1.2;
  color: #1e1b4b;
  font-family: 'Space Grotesk', sans-serif;
  animation: fadeInUp 1s ease-out;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 200px;
  }
}

.hero-title-gradient {
  display: inline-block;
  margin-top: 0.2em;
  background: linear-gradient(120deg, #60a5fa, #a78bfa, #ec4899, #f472b6);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 300;
  font-style: italic;
  filter: drop-shadow(0 10px 30px rgba(168, 85, 247, 0.4));
  animation: gradientShift 3s ease infinite, fadeInUp 1.2s ease-out 0.2s both;
}

.hero-desc {
  font-size: 22px;
  color: rgba(30, 27, 75, 0.7);
  margin-bottom: 80px;
  max-width: 768px;
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.8;
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 1s ease-out 0.4s both;
}

@media (min-width: 768px) {
  .hero-desc {
    font-size: 28px;
  }
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

@media (min-width: 768px) {
  .hero-actions {
    flex-direction: row;
  }
}

.hero-primary-btn {
  position: relative;
  overflow: hidden;
  padding: 28px 72px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.3em;
  box-shadow: 0 20px 50px rgba(99, 102, 241, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 1s ease-out 0.6s both;
}

.hero-primary-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, #2563eb, #9333ea, #db2777, #ec4899);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

.hero-primary-btn:hover {
  transform: translateY(-4px) scale(1.08);
  box-shadow: 0 30px 60px rgba(99, 102, 241, 0.4);
}

.hero-primary-btn:active {
  transform: translateY(-2px) scale(1.05);
}

.btn-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.hero-platforms {
  display: flex;
  align-items: center;
  gap: 40px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(30, 27, 75, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 1s ease-out 0.8s both;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
}

.platform-item:hover {
  color: #1e1b4b;
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}
</style>
