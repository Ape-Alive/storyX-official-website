<template>
  <section class="preview-section">
    <div class="preview-container">
      <div class="preview-wrapper">
        <div class="preview-glow"></div>
        <div class="preview-content">
          <div class="preview-overlay"></div>
          <div class="preview-inner">
            <div class="preview-grid"></div>
            <div class="preview-center">
              <div class="play-button" @click="$emit('play-click')">
                <el-icon :size="40" color="white">
                  <VideoPlay />
                </el-icon>
              </div>
              <span class="preview-label">RENDER ENGINE PREVIEW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { VideoPlay } from '@element-plus/icons-vue'

defineEmits(['play-click'])
</script>

<style scoped>
.preview-section {
  padding: 0 32px 192px;
  z-index: 10;
  position: relative;
}

.preview-container {
  max-width: 1280px;
  margin: 0 auto;
}

.preview-wrapper {
  position: relative;
}

.preview-wrapper:hover .preview-glow {
  opacity: 0.3;
}

.preview-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(to right, #3b82f6, #a855f7, #ec4899);
  border-radius: 64px;
  filter: blur(4px);
  opacity: 0.1;
  transition: opacity 1s;
}

.preview-content {
  position: relative;
  border-radius: 56px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  background: rgba(255, 255, 255, 0.4);
  padding: 24px;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  overflow: hidden;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
  opacity: 0.5;
  pointer-events: none;
}

.preview-inner {
  position: relative;
  border-radius: 44px;
  background: #050507;
  aspect-ratio: 21 / 9;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.preview-grid {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.2;
  pointer-events: none;
}

.preview-grid::before {
  content: '';
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #3b82f6, transparent);
}

.preview-grid::after {
  content: '';
  position: absolute;
  height: 100%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #ec4899, transparent);
}

.preview-center {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.7s;
}

.preview-wrapper:hover .preview-center {
  transform: scale(1.1);
}

.play-button {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 50px rgba(168, 85, 247, 0.2);
  transition: all 0.3s;
  cursor: pointer;
}

.preview-wrapper:hover .play-button {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 80px rgba(168, 85, 247, 0.4);
}

.play-button svg {
  margin-left: 6px;
}

.preview-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.8em;
  text-transform: uppercase;
}
</style>
