<template>
  <div class="feature-card" :class="cardClass">
    <div class="feature-card-glow" :class="glowClass"></div>

    <div class="feature-card-header">
      <div class="feature-icon-wrapper">
        <el-icon :size="28" class="feature-icon">
          <component :is="icon" />
        </el-icon>
      </div>
      <span class="feature-label">{{ label }}</span>
    </div>

    <h3 class="feature-title">{{ title }}</h3>
    <p class="feature-desc">{{ desc }}</p>

    <div class="feature-footer">
      <div class="feature-link">
        探索技术细节
        <el-icon :size="16" color="#a855f7">
          <ArrowRight />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  },
  span: {
    type: Number,
    default: 12
  }
})

const cardClass = `col-span-${props.span}`
const glowClass = `glow-${props.color}`
</script>

<style scoped>
.feature-card {
  position: relative;
  border-radius: 40px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  background: rgba(255, 255, 255, 0.4);
  overflow: hidden;
  padding: 48px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  height: 450px;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
}

.feature-card-glow {
  position: absolute;
  right: -80px;
  top: -80px;
  width: 256px;
  height: 256px;
  filter: blur(100px);
  opacity: 0;
  transition: opacity 0.7s;
  border-radius: 50%;
}

.feature-card:hover .feature-card-glow {
  opacity: 0.2;
}

.glow-blue {
  background: #2563eb;
}

.glow-purple {
  background: #9333ea;
}

.glow-pink {
  background: #db2777;
}

.glow-indigo {
  background: #4f46e5;
}

.feature-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 64px;
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #4f46e5;
  transition: all 0.5s;
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.15);
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1);
}

.feature-icon {
  transition: color 0.3s;
}

.feature-card:hover .feature-icon {
  color: #a78bfa;
}

.feature-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(30, 27, 75, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-family: 'Inter', sans-serif;
}

.feature-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e1b4b;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: 'Space Grotesk', sans-serif;
}

.feature-card:hover .feature-title {
  transform: translateX(6px);
  color: #1e1b4b;
}

.feature-desc {
  color: rgba(30, 27, 75, 0.7);
  font-size: 18px;
  line-height: 1.8;
  max-width: 384px;
  font-weight: 400;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.feature-card:hover .feature-desc {
  color: rgba(30, 27, 75, 0.9);
}

.feature-footer {
  margin-top: auto;
  padding-top: 40px;
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.3s;
}

.feature-card:hover .feature-footer {
  opacity: 1;
  transform: translateY(0);
}

.feature-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.feature-card:hover .feature-link {
  gap: 16px;
  transform: translateX(4px);
}

/* Grid columns */
.col-span-12 {
  grid-column: span 12;
}

.col-span-8 {
  grid-column: span 8;
}

.col-span-4 {
  grid-column: span 4;
}

@media (max-width: 768px) {
  .col-span-8,
  .col-span-4 {
    grid-column: span 12;
  }
}
</style>
