<template>
  <div class="plan-card" :class="{ 'plan-warning': plan.status === 'warning' }">
    <div v-if="plan.status === 'warning'" class="warning-badge">额度将尽</div>
    <div class="plan-header">
      <div>
        <h4 class="plan-name">{{ plan.name }}</h4>
        <p class="plan-expiry">
          有效期至: 
          <template v-if="plan.expiry">
            {{ plan.expiry }} ({{ plan.price === 0 || plan.price === null ? '永久' : '自动续费中' }})
          </template>
          <template v-else>
            永久
          </template>
        </p>
      </div>
      <div class="plan-percentage">
        <span class="percentage-value">{{ percentage }}%</span>
        <span class="percentage-label">消耗率</span>
      </div>
    </div>
    <div class="plan-progress-bar">
      <div
        class="progress-fill"
        :class="{ 'progress-warning': plan.status === 'warning' }"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
    <div class="plan-stats">
      <span class="stat-text">已消耗 {{ (plan.used / 1000).toFixed(1) }}k 积分</span>
      <span class="stat-text">剩余 {{ ((plan.limit - plan.used) / 1000).toFixed(1) }}k 积分</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

const percentage = computed(() => {
  return Math.round((props.plan.used / props.plan.limit) * 100)
})
</script>

<style scoped>
.plan-card {
  padding: 24px;
  border-radius: 24px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  border-color: rgba(147, 51, 234, 0.2);
}

.plan-warning {
  border-color: rgba(251, 191, 36, 0.3);
}

.warning-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 16px;
  background: #facc15;
  color: black;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom-left-radius: 12px;
}

.plan-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .plan-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.plan-name {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.plan-expiry {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 4px 0 0 0;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.plan-percentage {
  text-align: right;
}

.percentage-value {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.percentage-label {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-left: 4px;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.plan-progress-bar {
  width: 100%;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 12px;
  transition: background-color 0.3s ease;
}

.progress-fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: 9999px;
  transition: width 1s ease;
}

.progress-warning {
  background: linear-gradient(to right, #facc15, #f97316);
}

.plan-stats {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}
</style>
