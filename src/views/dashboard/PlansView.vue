<template>
  <div class="plans-view">
    <div class="plans-header">
      <h2 class="plans-title">选择您的算力规模</h2>
      <p class="plans-desc">根据您的制片强度选择合适的配额，支持随时横向扩展。</p>
    </div>

    <div class="plans-grid">
      <div
        v-for="(plan, idx) in plans"
        :key="idx"
        class="plan-card"
        :class="{ popular: plan.popular, current: plan.current }"
      >
        <div v-if="plan.popular" class="popular-badge">最受欢迎</div>
        <div class="plan-header">
          <div class="plan-title-wrapper">
            <h3 class="plan-title">{{ plan.name }}</h3>
            <div v-if="plan.current" class="current-badge">当前套餐</div>
          </div>
          <p class="plan-desc">{{ plan.desc }}</p>
          <div class="plan-price">
            <span class="price-value">¥{{ plan.price }}</span>
            <span class="price-unit">/月</span>
          </div>
        </div>
        <div class="plan-features">
          <div
            v-for="(feature, i) in plan.features"
            :key="i"
            class="feature-item"
          >
            <div class="feature-icon">
              <el-icon :size="12"><ArrowRight /></el-icon>
            </div>
            {{ feature }}
          </div>
        </div>
        <button
          :class="['plan-btn', { disabled: plan.current }]"
          :disabled="plan.current"
        >
          {{ plan.current ? '当前正在使用' : '立即选择' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

const plans = ref([
  {
    name: '试用版',
    price: '0',
    desc: '新锐导演初体验',
    features: ['每月 1k 字符额度', '标准节点接入', '全套 API 文档'],
    current: true
  },
  {
    name: '创作者',
    price: '299',
    desc: '独立创作者首选',
    features: ['每月 50k 字符额度', '极速制片通道', '24/7 优先支持', '无水印生成'],
    current: true,
    popular: true
  },
  {
    name: '工作室',
    price: '1999',
    desc: '工作室生产力集群',
    features: ['每月 1M 字符额度', '独立专有算力', '多账户协同管理', '专属技术总监'],
    current: false
  }
])
</script>

<style scoped>
.plans-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.plans-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 64px;
}

.plans-title {
  font-size: 40px;
  font-weight: 900;
  margin: 0 0 16px 0;
  color: var(--text-primary);
  transition: color 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.plans-desc {
  color: var(--text-secondary);
  margin: 0;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.plan-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.5s;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.plan-card:hover {
  transform: translateY(-12px);
}

.plan-card.popular {
  border-color: rgba(147, 51, 234, 0.2);
  box-shadow: 0 20px 50px rgba(147, 51, 234, 0.1);
  border-width: 4px;
  border-style: solid;
  border-image: linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)) 1;
}

.popular-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 24px;
  background: var(--accent-gradient);
  color: white;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  font-family: 'Inter', sans-serif;
}

.plan-header {
  margin-bottom: 32px;
}

.plan-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.plan-title {
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
}

.current-badge {
  padding: 4px 8px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  font-size: 10px;
  font-weight: 900;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
}

.plan-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  margin: 0 0 24px 0;
  font-weight: 500;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-value {
  font-size: 48px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.02em;
  font-family: 'Space Grotesk', sans-serif;
}

.price-unit {
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
  flex: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.feature-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.plan-btn {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.plan-btn:not(.disabled) {
  background: black;
  color: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.plan-btn:not(.disabled):hover {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 12px 40px rgba(147, 51, 234, 0.2);
}

.plan-btn.disabled {
  background: var(--bg-tertiary);
  color: var(--text-disabled);
  transition: background-color 0.3s ease, color 0.3s ease;
  cursor: default;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
