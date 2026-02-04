<template>
  <div class="workflow-page">
    <div class="workflow-container">
      <!-- Phase 01: Writing -->
      <div class="phase-section">
        <div class="phase-content">
          <div class="phase-header">
            <el-icon :size="16" color="#60a5fa" class="phase-icon">
              <Lightning />
            </el-icon>
            <span class="phase-label">PHASE 01: WRITING</span>
          </div>
          <h2 class="phase-title">智能剧本架构</h2>
          <p class="phase-desc">
            DeepSeek-V3 核心驱动，深度拆解小说原著灵魂，通过多维 Agent 自动生成具有强冲突性、符合短剧节奏的专业剧本。
          </p>
          <a href="#" class="phase-link">技术文档与规范 →</a>
        </div>
        <div class="phase-card">
          <div class="card-icon-wrapper card-icon-blue">
            <el-icon :size="32" color="#fff">
              <Lightning />
            </el-icon>
          </div>
          <p class="card-text">[剧本编辑器界面:智能分幕、对白优化、情感曲线分析]</p>
          <div class="card-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>

      <!-- Phase 02: Consistency -->
      <div class="phase-section phase-section-reverse">
        <div class="phase-card">
          <div class="card-icon-wrapper card-icon-purple">
            <el-icon :size="32" color="#fff">
              <Menu />
            </el-icon>
          </div>
          <p class="card-text">[角色建模资产库:面部特征锁定、服饰材质同步、环境光感适配]</p>
          <div class="card-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
        <div class="phase-content">
          <div class="phase-header">
            <el-icon :size="16" color="#a855f7" class="phase-icon">
              <Menu />
            </el-icon>
            <span class="phase-label phase-label-purple">PHASE 02: CONSISTENCY</span>
          </div>
          <h2 class="phase-title">资产实时一致性</h2>
          <p class="phase-desc">
            独家神经网络面部锚定技术，确保角色在数千个分镜、不同运镜角度及极端光影下表现绝对统一，建立稳固的资产库。
          </p>
          <a href="#" class="phase-link phase-link-purple">技术文档与规范 →</a>
        </div>
      </div>

      <!-- Phase 03: Rendering -->
      <div class="phase-section">
        <div class="phase-content">
          <div class="phase-header">
            <el-icon :size="16" color="#ec4899" class="phase-icon">
              <VideoPlay />
            </el-icon>
            <span class="phase-label phase-label-pink">PHASE 03: RENDERING</span>
          </div>
          <h2 class="phase-title">4K 级视频渲染</h2>
          <p class="phase-desc">
            Luma / Sora 级引擎驱动，赋予静态分镜极具电影感的运镜、光影与叙事张力，实现从文字到视觉的完美转化。
          </p>
          <a href="#" class="phase-link phase-link-pink">技术文档与规范 →</a>
        </div>
        <div class="phase-card">
          <div class="card-icon-wrapper card-icon-pink">
            <el-icon :size="32" color="#fff">
              <VideoPlay />
            </el-icon>
          </div>
          <p class="card-text">[渲染引擎界面:实时预览、参数调节、批量导出]</p>
          <div class="card-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>

      <!-- Phase 04: Distribution -->
      <div class="phase-section phase-section-reverse">
        <div class="phase-card">
          <div class="card-icon-wrapper card-icon-indigo">
            <el-icon :size="32" color="#fff">
              <Link />
            </el-icon>
          </div>
          <p class="card-text">[全模态分发系统:多语言配音、自动字幕、情感配乐]</p>
          <div class="card-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
        <div class="phase-content">
          <div class="phase-header">
            <el-icon :size="16" color="#4f46e5" class="phase-icon">
              <Link />
            </el-icon>
            <span class="phase-label phase-label-indigo">PHASE 04: DISTRIBUTION</span>
          </div>
          <h2 class="phase-title">全模态分发流</h2>
          <p class="phase-desc">
            内置多语言 AI 克隆配音、自动字幕与情感配乐系统，一键导出全球适配成片，实现从创作到分发的完整闭环。
          </p>
          <a href="#" class="phase-link phase-link-indigo">技术文档与规范 →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lightning, Menu, VideoPlay, Link } from '@element-plus/icons-vue'
</script>

<style scoped>
.workflow-page {
  min-height: 100vh;
  background: linear-gradient(to right, #faf5ff, #ffffff);
  color: #1e1b4b;
  padding-top: 80px;
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰 */
.workflow-page::before {
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

.workflow-page::after {
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

.workflow-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 160px 32px 120px;
  position: relative;
  z-index: 10;
}

.phase-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-bottom: 120px;
  align-items: start;
}

.phase-section-reverse {
  grid-template-columns: 1fr 1fr;
}

.phase-section-reverse .phase-content {
  order: 2;
}

.phase-section-reverse .phase-card {
  order: 1;
}

@media (max-width: 1024px) {
  .phase-section {
    grid-template-columns: 1fr;
    gap: 40px;
    margin-bottom: 80px;
  }

  .phase-section-reverse .phase-content,
  .phase-section-reverse .phase-card {
    order: 0;
  }
}

.phase-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.phase-icon {
  flex-shrink: 0;
}

.phase-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #60a5fa;
  font-family: 'Inter', sans-serif;
}

.phase-label-purple {
  color: #a855f7;
}

.phase-label-pink {
  color: #ec4899;
}

.phase-label-indigo {
  color: #4f46e5;
}

.phase-title {
  font-size: 48px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0;
  line-height: 1.2;
  font-family: 'Space Grotesk', sans-serif;
}

@media (min-width: 768px) {
  .phase-title {
    font-size: 64px;
  }
}

.phase-desc {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(30, 27, 75, 0.7);
  margin: 0;
  font-family: 'Inter', sans-serif;
}

@media (min-width: 768px) {
  .phase-desc {
    font-size: 18px;
  }
}

.phase-link {
  font-size: 14px;
  font-weight: 500;
  color: #60a5fa;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.phase-link:hover {
  color: #3b82f6;
  transform: translateX(4px);
}

.phase-link-purple {
  color: #a855f7;
}

.phase-link-purple:hover {
  color: #9333ea;
}

.phase-link-pink {
  color: #ec4899;
}

.phase-link-pink:hover {
  color: #db2777;
}

.phase-link-indigo {
  color: #4f46e5;
}

.phase-link-indigo:hover {
  color: #4338ca;
}

.phase-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  transition: all 0.3s;
}

.phase-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

.card-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-blue {
  background: #60a5fa;
}

.card-icon-purple {
  background: #a855f7;
}

.card-icon-pink {
  background: #ec4899;
}

.card-icon-indigo {
  background: #4f46e5;
}

.card-text {
  font-size: 13px;
  color: rgba(30, 27, 75, 0.6);
  text-align: center;
  margin: 0;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
}

.card-progress {
  width: 100%;
  height: 4px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #9333ea, #ec4899);
  border-radius: 2px;
  animation: progressAnimation 2s ease-in-out infinite;
}

@keyframes progressAnimation {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
}
</style>
