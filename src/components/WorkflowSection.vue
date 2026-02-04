<template>
  <section id="workflow" class="workflow-section">
    <div class="workflow-container">
      <div class="workflow-header">
        <div class="workflow-header-content">
          <h2 class="workflow-title">
            制片全流程。
          </h2>
          <p class="workflow-subtitle">
            从文字灵感到 4K 视觉震撼，色彩、音效与情感的完美闭环。
          </p>
        </div>
        <div class="workflow-indicators">
          <div v-for="i in 3" :key="i" class="indicator">
            <div class="indicator-bar"></div>
          </div>
        </div>
      </div>

      <div class="workflow-grid">
        <FeatureCard
          :icon="Flash"
          title="智能剧本架构"
          desc="DeepSeek-V3 核心驱动，深度拆解故事曲线，自动生成工业级标准的短剧剧本与对白。"
          label="Intelligence"
          color="blue"
          :span="8"
        />
        <FeatureCard
          :icon="Menu"
          title="角色资产一致性"
          desc="通过跨模态特征锚定技术，确保主角面容与服饰在所有镜头中表现绝对一致。"
          label="Consistency"
          color="purple"
          :span="4"
        />
        <FeatureCard
          :icon="VideoPlay"
          title="4K 级视频渲染"
          desc="Luma / Sora 级引擎驱动，赋予静态分镜极具电影感的运镜、光影与叙事张力。"
          label="Cinematography"
          color="pink"
          :span="4"
        />
        <FeatureCard
          :icon="Connection"
          title="全模态分发流"
          desc="内置多语言 AI 克隆配音、自动字幕与情感配乐系统，一键导出全球适配成片。"
          label="Distribution"
          color="indigo"
          :span="8"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import FeatureCard from './FeatureCard.vue'
import { Lightning, Grid, VideoPlay, Link } from '@element-plus/icons-vue'
</script>

<style scoped>
.workflow-section {
  padding: 192px 32px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
  background: linear-gradient(to bottom, transparent, rgba(250, 245, 255, 0.5));
  z-index: 10;
  position: relative;
}

.workflow-container {
  max-width: 1280px;
  margin: 0 auto;
}

.workflow-header {
  margin-bottom: 112px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
}

@media (min-width: 768px) {
  .workflow-header {
    flex-direction: row;
    text-align: left;
  }
}

.workflow-header-content {
  flex: 1;
}

.workflow-title {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 32px;
  color: #1e1b4b;
  font-style: italic;
  text-decoration: underline;
  text-decoration-color: rgba(168, 85, 247, 0.4);
  text-decoration-thickness: 6px;
  text-underline-offset: 12px;
  font-family: 'Space Grotesk', sans-serif;
  animation: fadeInUp 0.8s ease-out;
}

@media (min-width: 768px) {
  .workflow-title {
    font-size: 88px;
  }
}

.workflow-subtitle {
  color: rgba(30, 27, 75, 0.6);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.workflow-indicators {
  display: flex;
  gap: 16px;
}

.indicator {
  width: 48px;
  height: 4px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}

.indicator-bar {
  height: 100%;
  width: 33.333%;
  background: #a855f7;
  animation: pulse 2s ease-in-out infinite;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 40px;
}

@media (max-width: 768px) {
  .workflow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
