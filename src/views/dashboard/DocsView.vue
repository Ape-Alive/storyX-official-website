<template>
  <div class="docs-view">
    <div class="docs-grid">
      <div class="docs-content">
        <h2 class="docs-title">开发集成指引</h2>
        <p class="docs-desc">
          获取您的 API 密钥，并在几分钟内将 StoryX 的大模型能力集成到您的制片工作流中。
        </p>
        <div class="code-block">
          <div class="code-header">
            <div class="code-dot"></div>
            <div class="code-dot"></div>
            <div class="code-dot"></div>
          </div>
          <div class="code-content">
            <p class="code-comment"># 安装生产环境 SDK</p>
            <p class="code-line">npm install @story-x/engine</p>
            <p class="code-comment code-spacing">// 初始化客户端实例</p>
            <p class="code-line">
              <span class="code-keyword">const</span> storyEngine =
              <span class="code-keyword">new</span> StoryXClient('您的密钥');
            </p>
          </div>
        </div>
      </div>
      <div class="docs-links">
        <div
          v-for="(doc, i) in docLinks"
          :key="i"
          class="doc-link-card"
        >
          <div class="doc-link-icon">
            <el-icon :size="22"><component :is="doc.icon" /></el-icon>
          </div>
          <div class="doc-link-content">
            <h4 class="doc-link-title">{{ doc.title }}</h4>
            <p class="doc-link-desc">{{ doc.desc }}</p>
          </div>
          <el-icon :size="18" class="doc-link-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Link, Document, ChatLineRound, ArrowRight } from '@element-plus/icons-vue'

const docLinks = ref([
  { title: 'API 接口文档', desc: '端点定义与核心参数规范说明', icon: Link },
  { title: '模型能力概览', desc: '探索各型号算力节点的能力边界', icon: Document },
  { title: 'Webhooks 回调', desc: '异步任务回调与状态监听配置', icon: ChatLineRound }
])
</script>

<style scoped>
.docs-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 24px;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 1024px) {
  .docs-grid {
    grid-template-columns: 1fr;
  }
}

.docs-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.docs-title {
  font-size: 40px;
  font-weight: 900;
  margin: 0;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.docs-desc {
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.code-block {
  padding: 32px;
  background: #0d0d0d;
  border-radius: 40px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.code-header {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;
}

.code-dot:nth-child(1) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.code-dot:nth-child(2) {
  background: rgba(234, 179, 8, 0.2);
  border-color: rgba(234, 179, 8, 0.5);
}

.code-dot:nth-child(3) {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}

.code-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.code-comment {
  color: rgba(147, 51, 234, 0.8);
  letter-spacing: -0.01em;
  margin: 0;
}

.code-spacing {
  margin-top: 24px;
}

.code-line {
  color: white;
  font-style: italic;
  letter-spacing: -0.02em;
  margin: 0;
}

.code-keyword {
  color: #ec4899;
  font-weight: 700;
}

.docs-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.doc-link-card {
  background: var(--bg-card);
  border: 2px dashed var(--border-color);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.doc-link-card:hover {
  background: var(--bg-hover);
  border-color: rgba(147, 51, 234, 0.3);
}

.doc-link-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--accent-color);
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-link-content {
  flex: 1;
}

.doc-link-title {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.02em;
  margin: 0 0 4px 0;
  font-family: 'Space Grotesk', sans-serif;
}

.doc-link-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  font-weight: 500;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.doc-link-arrow {
  color: var(--text-disabled);
  transition: color 0.3s ease;
  flex-shrink: 0;
}
</style>
