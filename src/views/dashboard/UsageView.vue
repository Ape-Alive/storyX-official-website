<template>
  <div class="usage-view">
    <div class="view-header">
      <div>
        <h2 class="view-title">消耗分析</h2>
        <p class="view-desc">可视化追踪您的 AI 调用足迹</p>
      </div>
      <div class="time-range-selector">
        <button
          v-for="range in timeRanges"
          :key="range.id"
          :class="['range-btn', { active: trendRange === range.id }]"
          @click="trendRange = range.id"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-legend">
        <span class="legend-item">
          <span class="legend-dot bg-purple-500"></span>
          Story-X 4.0
        </span>
        <span class="legend-item">
          <span class="legend-dot bg-pink-400"></span>
          视觉引擎
        </span>
      </div>
      <div class="chart-bars">
        <div
          v-for="(val, i) in trendData[trendRange]"
          :key="i"
          class="chart-bar-wrapper"
        >
          <div class="chart-bar-container">
            <div
              class="chart-bar"
              :style="{ height: `${(val / maxValue) * 100}%` }"
            ></div>
          </div>
          <span class="chart-label">{{ getLabel(i) }}</span>
        </div>
      </div>
    </div>

    <div class="logs-section">
      <div class="logs-header">
        <h3 class="logs-title">接口调用日志</h3>
        <button class="export-btn">
          导出表格
          <el-icon :size="14"><Link /></el-icon>
        </button>
      </div>
      <div class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>请求时间</th>
              <th>调用模型</th>
              <th>消耗额度</th>
              <th>任务状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ log.time }}</td>
              <td class="model-name">{{ log.model }}</td>
              <td class="cost">{{ log.cost }}</td>
              <td>
                <span :class="['status-badge', { error: log.error }]">
                  {{ log.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Link } from '@element-plus/icons-vue'

const trendRange = ref('day')

const timeRanges = [
  { id: 'day', label: '日视图' },
  { id: 'week', label: '周视图' },
  { id: 'month', label: '月视图' }
]

const trendData = {
  day: [20, 45, 30, 80, 50, 90, 70],
  week: [400, 600, 550, 900, 1100, 800, 950],
  month: [12000, 15000, 11000, 18000, 22000, 25000, 21000]
}

const logs = ref([
  { id: 1, time: '2024-05-20 14:22:01', model: 'Story-X-Turbo', cost: '12 字符', status: '成功' },
  { id: 2, time: '2024-05-20 13:05:44', model: 'Vision-Agent-V2', cost: '500 字符', status: '成功' },
  { id: 3, time: '2024-05-19 18:12:10', model: 'Story-X-Pro', cost: '85 字符', status: '成功' },
  { id: 4, time: '2024-05-19 11:30:00', model: 'Story-X-Turbo', cost: '10 字符', status: '余额不足', error: true }
])

const maxValue = computed(() => {
  return Math.max(...trendData[trendRange.value])
})

const getLabel = (index) => {
  if (trendRange.value === 'day') {
    return `0${index + 1}`
  } else if (trendRange.value === 'week') {
    return `W${index + 1}`
  }
  return `M${index + 1}`
}
</script>

<style scoped>
.usage-view {
  animation: fadeInSlide 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.view-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
}

@media (min-width: 768px) {
  .view-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.view-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--text-primary);
  transition: color 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.view-desc {
  color: var(--text-secondary);
  margin: 0;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.time-range-selector {
  display: flex;
  padding: 4px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  width: fit-content;
  transition: background-color 0.3s ease;
}

.range-btn {
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.range-btn:hover {
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.range-btn.active {
  background: var(--bg-card);
  transition: background-color 0.3s ease;
  color: var(--accent-color);
  box-shadow: var(--shadow-sm);
  transition: color 0.3s ease;
}

.chart-card {
  background: var(--bg-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  border: 1px solid var(--border-color);
  border-radius: 32px;
  padding: 32px;
  height: 350px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-legend {
  position: absolute;
  top: 32px;
  left: 32px;
  display: flex;
  gap: 24px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bg-purple-500 {
  background: var(--accent-color);
}

.bg-pink-400 {
  background: #ec4899;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-top: 64px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.chart-bar-container {
  width: 100%;
  max-width: 32px;
  height: 220px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.chart-bar {
  width: 100%;
  background: var(--accent-gradient);
  border-radius: 8px 8px 0 0;
  transition: height 0.7s ease 0.15s;
}

.chart-bar:hover {
  filter: brightness(1.1);
}

.chart-label {
  font-size: 10px;
  font-family: 'Courier New', monospace;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  text-transform: uppercase;
}

.logs-section {
  margin-top: 48px;
}

.logs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.logs-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  transition: color 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-color);
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.export-btn:hover {
  background: rgba(147, 51, 234, 0.15);
}

.logs-table-wrapper {
  overflow: hidden;
  border-radius: 32px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.logs-table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}

.logs-table thead {
  background: var(--bg-tertiary);
  transition: background-color 0.3s ease;
}

.logs-table th {
  padding: 20px 32px;
  font-size: 10px;
  font-weight: 900;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--border-color);
  font-family: 'Inter', sans-serif;
}

.logs-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.3s, border-color 0.3s ease;
}

.logs-table tbody tr:hover {
  background: var(--bg-hover);
}

.logs-table td {
  padding: 20px 32px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.model-name {
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.cost {
  font-family: 'Courier New', monospace;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  font-family: 'Inter', sans-serif;
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
</style>
