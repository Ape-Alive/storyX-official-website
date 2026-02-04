<template>
  <div class="stat-card">
    <div class="stat-icon-wrapper" :class="iconBgClass">
      <el-icon :size="22" :class="iconColorClass">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <div class="stat-value-wrapper">
        <span class="stat-value">{{ value }}</span>
        <span class="stat-trend" :class="trendClass">{{ trend }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  trend: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  iconBgClass: {
    type: String,
    default: 'bg-yellow-50'
  },
  iconColorClass: {
    type: String,
    default: 'text-yellow-500'
  },
  trendClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 10px;
  font-weight: 900;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 4px 0;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.stat-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.stat-trend {
  font-size: 10px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.stat-trend.text-red-400 {
  color: #f87171;
}

.stat-trend.text-green-500 {
  color: #22c55e;
}
</style>
