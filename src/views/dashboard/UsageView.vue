<template>
  <div class="usage-view">
    <div class="view-header">
      <div>
        <h2 class="view-title">消耗分析</h2>
        <p class="view-desc">多维度可视化追踪您的AI调用足迹与资源分布</p>
      </div>
      <div class="header-controls">
        <div class="time-range-selector">
          <button
            v-for="range in timeRanges"
            :key="range.id"
            :class="['range-btn', { active: trendRange === range.id }]"
            @click="handlePeriodChange(range.id)"
          >
            {{ range.label }}
          </button>
        </div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          class="date-picker"
          @change="handleDateRangeChange"
        />
      </div>
    </div>

    <div class="chart-card" v-loading="trendLoading">
      <div class="chart-legend">
        <span class="legend-item">
          <span class="legend-dot legend-bar legend-bar-cost"></span>
          消耗额度（积分）
        </span>
        <span class="legend-item">
          <span class="legend-dot legend-line legend-line-count"></span>
          次数
        </span>
        <span class="chart-unit">① 单位: 积分/次数</span>
      </div>
      <div class="chart-container" v-if="chartData.length > 0">
        <v-chart
          class="echarts-chart"
          :option="chartOption"
          :loading="trendLoading"
          autoresize
        />
      </div>
      <div v-else class="chart-empty">
        <p>暂无数据</p>
      </div>
    </div>

    <div class="logs-section">
      <div class="logs-header">
        <h3 class="logs-title">调用日志</h3>
        <div class="logs-header-right">
          <div class="logs-filters">
            <el-select
              v-model="logFilters.modelId"
              placeholder="选择模型"
              clearable
              class="filter-select"
              :loading="modelsLoading"
              @change="handleLogFilterChange"
            >
              <el-option
                v-for="model in availableModels"
                :key="model.id"
                :label="model.displayName"
                :value="model.id"
              />
            </el-select>
            <el-select
              v-model="logFilters.status"
              placeholder="选择状态"
              clearable
              class="filter-select"
              @change="handleLogFilterChange"
            >
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failure" />
            </el-select>
            <el-date-picker
              v-model="logFilters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              class="filter-date-picker"
              @change="handleLogFilterChange"
            />
          </div>
          <button class="export-btn">
            导出表格
            <el-icon :size="14"><Link /></el-icon>
          </button>
        </div>
      </div>
      <div class="logs-table-wrapper" v-loading="logsLoading">
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
            <tr v-if="logs.length === 0">
              <td colspan="4" class="empty-cell">暂无数据</td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatDateTime(log.requestTime) }}</td>
              <td class="model-name">
                {{ log.model?.displayName || log.model?.name || '-' }}
              </td>
              <td class="cost">{{ log.cost || 0 }} 积分</td>
              <td>
                <span
                  :class="['status-badge', { error: log.status === 'failure' }]"
                >
                  {{ log.status === 'success' ? '成功' : '失败' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-wrapper" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
          class="custom-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getUsageTrend, getAILogs, getModels } from '@/api/usage'
import { formatDate } from '@/utils/index'
import { useThemeStore } from '@/stores/modules/theme'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 获取主题 store
const themeStore = useThemeStore()

const trendRange = ref('day')
const dateRange = ref(null)
const trendLoading = ref(false)
const logsLoading = ref(false)

const timeRanges = [
  { id: 'day', label: '日视图' },
  { id: 'week', label: '周视图' },
  { id: 'month', label: '月视图' }
]

// 图表数据
const usageTrendData = ref([])
const chartModels = ref([])
const chartData = ref([])

// 日志数据
const logs = ref([])
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 调用日志筛选条件
const logFilters = ref({
  modelId: null,
  status: null,
  dateRange: null
})

// 可用模型列表（从接口获取）
const availableModels = ref([])
const modelsLoading = ref(false)

// 加载模型列表
const loadModels = async () => {
  try {
    modelsLoading.value = true
    const response = await getModels({
      page: 1,
      pageSize: 100, // 获取所有模型
      isActive: true // 只获取启用的模型
    })
    
    if (response.success && response.data) {
      availableModels.value = response.data.map(model => ({
        id: model.id,
        displayName: model.displayName || model.name || '未知模型',
        name: model.name
      })).sort((a, b) => 
        a.displayName.localeCompare(b.displayName, 'zh-CN')
      )
    }
  } catch (error) {
    console.error('加载模型列表失败:', error)
    ElMessage.error('加载模型列表失败，请稍后重试')
  } finally {
    modelsLoading.value = false
  }
}

// 处理调用日志筛选变化
const handleLogFilterChange = () => {
  pagination.value.page = 1 // 重置到第一页
  loadLogs()
}

// 格式化数字（简化显示）
const formatNumber = (num) => {
  if (num === 0) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return Math.round(num).toString()
}

// 响应式主题状态
const isDark = computed(() => themeStore.theme === 'dark')

// ECharts 配置选项
const chartOption = computed(() => {
  if (chartData.value.length === 0) {
    return {}
  }

  const categories = chartData.value.map(item => item.label)
  const costData = chartData.value.map(item => item.totalCost || 0)
  const countData = chartData.value.map(item => item.totalCount || 0)

  // 使用响应式主题状态
  // 浅色模式下使用更深的颜色以提高对比度
  const textColor = isDark.value ? '#ffffff' : 'rgba(26, 26, 26, 0.85)'
  const textSecondaryColor = isDark.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.75)'
  const gridColor = isDark.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)'
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#9333ea'
  const pinkColor = '#ec4899'
  
  // 深色主题下的背景色
  const backgroundColor = isDark.value ? 'transparent' : 'transparent'

  return {
    backgroundColor: backgroundColor,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        show: true,
        lineStyle: {
          color: isDark.value ? 'rgba(255, 255, 255, 0.2)' : gridColor,
          width: 1
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        margin: 12
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: isDark.value ? 'rgba(255, 255, 255, 0.15)' : gridColor,
          width: 1,
          opacity: isDark.value ? 0.5 : 0.3
        }
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: isDark.value ? 'rgba(255, 255, 255, 0.2)' : gridColor,
          width: 1
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        formatter: (value) => formatNumber(value),
        margin: 8
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: gridColor,
      textStyle: {
        color: textColor,
        fontSize: 12,
        fontFamily: 'Inter, sans-serif'
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: gridColor
        }
      }
    },
    series: [
      {
        name: '消耗额度（积分）',
        type: 'bar',
        data: costData,
        itemStyle: {
          color: accentColor,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%',
        label: {
          show: true,
          position: 'top',
          color: isDark.value ? '#ffffff' : 'rgba(26, 26, 26, 0.9)',
          fontSize: 10,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          textShadowBlur: isDark.value ? 2 : 1,
          textShadowColor: isDark.value ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
          formatter: (params) => {
            return params.value > 0 ? formatNumber(params.value) : ''
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: isDark.value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
          }
        }
      },
      {
        name: '次数',
        type: 'line',
        data: countData,
        lineStyle: {
          color: pinkColor,
          width: 2.5
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: pinkColor,
          borderColor: isDark.value ? '#ffffff' : '#ffffff',
          borderWidth: isDark.value ? 2 : 2
        },
        label: {
          show: true,
          position: 'top',
          color: isDark.value ? pinkColor : '#c026d3',
          fontSize: 10,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          textShadowBlur: isDark.value ? 2 : 1,
          textShadowColor: isDark.value ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',
          formatter: (params) => {
            return params.value > 0 ? formatNumber(params.value) : ''
          }
        },
        emphasis: {
          itemStyle: {
            borderColor: isDark.value ? '#ffffff' : pinkColor,
            borderWidth: 3,
            shadowBlur: 8,
            shadowColor: isDark.value ? 'rgba(236, 72, 153, 0.5)' : 'rgba(236, 72, 153, 0.3)'
          }
        }
      }
    ]
  }
})

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return formatDate(dateTime, 'YYYY-MM-DD HH:mm:ss')
}

// 根据时间段类型计算日期范围
const calculateDateRange = (period) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999) // 设置为今天的结束时间
  
  let startDate, endDate
  
  if (period === 'day') {
    // 日视图：今日到今日前7天（最近7天，包括今天）
    endDate = new Date(today)
    startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 6) // 7天前（包括今天共7天）
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    // 周视图：今日这周到前8周（最近8周，共8周）
    // 计算当前周的开始（周一）和结束（周日）
    const dayOfWeek = today.getDay() // 0=周日, 1=周一, ..., 6=周六
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 距离周一的天数
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek // 距离周日的天数
    
    // 结束日期：当前周的周日
    endDate = new Date(today)
    endDate.setDate(endDate.getDate() + daysToSunday)
    endDate.setHours(23, 59, 59, 999)
    
    // 开始日期：8周前的周一（往前推7周，加上当前周共8周）
    startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysToMonday - (7 * 7)) // 往前推7周（共8周）
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    // 月视图：当前月到前12个月（最近12个月）
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // 当前月的最后一天
    endDate.setHours(23, 59, 59, 999)
    
    startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1) // 12个月前的第一天
    startDate.setHours(0, 0, 0, 0)
  }
  
  // 格式化为 YYYY-MM-DD
  const formatDateStr = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return [formatDateStr(startDate), formatDateStr(endDate)]
}

// 处理时间段变化（只影响图表）
const handlePeriodChange = (period) => {
  trendRange.value = period
  // 自动设置日期范围
  dateRange.value = calculateDateRange(period)
  loadUsageTrend()
}

// 处理日期范围变化（只影响图表）
const handleDateRangeChange = () => {
  loadUsageTrend()
}

// 加载使用趋势数据
const loadUsageTrend = async () => {
  try {
    trendLoading.value = true
    const params = {
      period: trendRange.value
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = `${dateRange.value[0]}T00:00:00.000Z`
      params.endDate = `${dateRange.value[1]}T23:59:59.999Z`
    }
    
    const response = await getUsageTrend(params)
    
    if (response.success && response.data) {
      usageTrendData.value = response.data
      processChartData(response.data)
    }
  } catch (error) {
    console.error('加载使用趋势失败:', error)
    ElMessage.error('加载使用趋势失败，请稍后重试')
  } finally {
    trendLoading.value = false
  }
}

// 生成完整的时间段列表
const generateAllPeriods = () => {
  const periods = []
  const today = new Date()
  
  if (trendRange.value === 'day') {
    // 日视图：生成最近7天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      periods.push(`${year}-${month}-${day}`)
    }
  } else if (trendRange.value === 'week') {
    // 周视图：生成最近8周的周标识
    const dayOfWeek = today.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - daysToMonday - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      // 计算该周是当年的第几周（ISO周）
      const year = weekStart.getFullYear()
      const d = new Date(Date.UTC(year, weekStart.getMonth(), weekStart.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
      
      periods.push(`${year}-W${String(weekNum).padStart(2, '0')}`)
    }
  } else if (trendRange.value === 'month') {
    // 月视图：生成最近12个月的月份
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      periods.push(`${year}-${month}`)
    }
  }
  
  return periods
}

// 处理图表数据
const processChartData = (data) => {
  // 提取模型信息
  if (data && data.length > 0) {
    chartModels.value = data.map(item => ({
      modelId: item.modelId,
      displayName: item.model?.displayName || item.model?.name || '未知模型'
    }))
  } else {
    chartModels.value = []
  }
  
  // 生成完整的时间段列表（即使没有数据也要显示）
  const allPeriods = generateAllPeriods()
  
  // 构建数据映射（从API返回的数据）
  const dataMap = new Map()
  if (data && data.length > 0) {
    data.forEach(model => {
      model.trends?.forEach(trend => {
        const period = trend.period
        if (!dataMap.has(period)) {
          dataMap.set(period, { totalCount: 0, totalCost: 0 })
        }
        const periodData = dataMap.get(period)
        periodData.totalCount += trend.totalCount || 0
        periodData.totalCost += trend.totalCost || 0
      })
    })
  }
  
  // 构建图表数据 - 确保所有时间段都有数据（没有数据的填充0）
  chartData.value = allPeriods.map(period => {
    const periodData = dataMap.get(period) || { totalCount: 0, totalCost: 0 }
    
    return {
      label: formatPeriodLabel(period),
      period,
      totalCount: periodData.totalCount,
      totalCost: periodData.totalCost
    }
  })
}

// 格式化时间段标签
const formatPeriodLabel = (period) => {
  if (trendRange.value === 'day') {
    // 日视图：格式 2024-01-01 -> 01/15 (月/日)
    const parts = period.split('-')
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10)
      const day = parseInt(parts[2], 10)
      return `${month}/${day}`
    }
    return period
  } else if (trendRange.value === 'week') {
    // 周视图：格式 2024-W01 -> W01 或 第1周
    if (period.includes('W')) {
      const weekNum = period.split('W')[1]
      return `W${weekNum}`
    }
    // 如果没有W格式，尝试解析为日期范围
    return period
  } else {
    // 月视图：格式 2024-01 -> 01月
    const parts = period.split('-')
    if (parts.length === 2) {
      const month = parseInt(parts[1], 10)
      return `${month}月`
    }
    return period
  }
}


// 加载调用日志
const loadLogs = async () => {
  try {
    logsLoading.value = true
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    // 使用调用日志的独立筛选条件
    if (logFilters.value.modelId) {
      params.modelId = logFilters.value.modelId
    }
    
    if (logFilters.value.status) {
      params.status = logFilters.value.status
    }
    
    if (logFilters.value.dateRange && logFilters.value.dateRange.length === 2) {
      params.startDate = `${logFilters.value.dateRange[0]}T00:00:00.000Z`
      params.endDate = `${logFilters.value.dateRange[1]}T23:59:59.999Z`
    }
    
    const response = await getAILogs(params)
    
    if (response.success) {
      // 根据API文档，data可能是数组，也可能包含data和pagination
      if (Array.isArray(response.data)) {
        logs.value = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        logs.value = response.data.data
        if (response.data.pagination) {
          pagination.value.total = response.data.pagination.total || 0
        }
      } else {
        logs.value = []
      }
      
      // 如果pagination在顶层
      if (response.pagination) {
        pagination.value.total = response.pagination.total || 0
      }
    }
  } catch (error) {
    console.error('加载调用日志失败:', error)
    ElMessage.error('加载调用日志失败，请稍后重试')
  } finally {
    logsLoading.value = false
  }
}


// 处理分页变化
const handlePageChange = (page) => {
  pagination.value.page = page
  loadLogs()
}

// 处理每页数量变化
const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  loadLogs()
}

// 初始化
onMounted(() => {
  // 初始化时设置默认日期范围（日视图）
  dateRange.value = calculateDateRange(trendRange.value)
  loadUsageTrend()
  loadLogs()
  loadModels() // 加载模型列表
})
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.date-picker {
  --el-date-editor-width: 280px;
  --el-fill-color-blank: var(--bg-card);
  --el-fill-color: var(--bg-card);
}

.date-picker :deep(.el-input__wrapper),
.date-picker :deep(.el-input__wrapper.is-focus),
.date-picker :deep(.el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.date-picker :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-color) !important;
  background: var(--bg-card) !important;
}

.date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color) !important;
  background: var(--bg-card) !important;
  box-shadow: 0 0 0 1px var(--accent-color) inset !important;
}

.date-picker :deep(.el-input__inner) {
  color: var(--text-primary) !important;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: transparent !important;
}

.date-picker :deep(.el-input__inner::placeholder) {
  color: var(--text-tertiary) !important;
}

.date-picker :deep(.el-input__suffix) {
  color: var(--text-tertiary);
}

.date-picker :deep(.el-input__suffix:hover) {
  color: var(--accent-color);
}

.date-picker :deep(.el-range-separator) {
  color: var(--text-secondary) !important;
}

/* 日期选择器弹窗样式 */
.date-picker :deep(.el-picker__popper) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-lg) !important;
}

.date-picker :deep(.el-picker__popper .el-popper__arrow::before) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
}

.date-picker :deep(.el-date-range-picker__header) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.date-picker :deep(.el-date-range-picker__header button) {
  color: var(--text-primary) !important;
  background: transparent !important;
}

.date-picker :deep(.el-date-range-picker__header button:hover) {
  color: var(--accent-color) !important;
  background: var(--bg-hover) !important;
}

.date-picker :deep(.el-date-range-picker__header .el-picker-panel__icon-btn) {
  color: var(--text-primary) !important;
}

.date-picker :deep(.el-date-range-picker__header .el-picker-panel__icon-btn:hover) {
  color: var(--accent-color) !important;
  background: var(--bg-hover) !important;
}

.date-picker :deep(.el-picker-panel) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.date-picker :deep(.el-picker-panel__content) {
  background: var(--bg-card) !important;
}

.date-picker :deep(.el-picker-panel__header-label) {
  color: var(--text-primary) !important;
  font-weight: 600;
}

.date-picker :deep(.el-date-table th) {
  color: var(--text-secondary) !important;
  border-color: var(--border-color) !important;
  font-weight: 600;
  background: var(--bg-card) !important;
}

.date-picker :deep(.el-date-table td) {
  color: var(--text-primary) !important;
}

.date-picker :deep(.el-date-table td div) {
  color: var(--text-primary) !important;
}

.date-picker :deep(.el-date-table td.available) {
  color: var(--text-primary) !important;
}

.date-picker :deep(.el-date-table td.available:hover) {
  color: var(--accent-color) !important;
  background: var(--bg-hover) !important;
}

.date-picker :deep(.el-date-table td.available:hover div) {
  color: var(--accent-color) !important;
}

.date-picker :deep(.el-date-table td.current:not(.disabled)) {
  color: var(--accent-color) !important;
  font-weight: 700;
}

.date-picker :deep(.el-date-table td.current:not(.disabled) div) {
  color: var(--accent-color) !important;
}

.date-picker :deep(.el-date-table td.in-range) {
  background: var(--bg-hover) !important;
}

.date-picker :deep(.el-date-table td.in-range div) {
  color: var(--text-primary) !important;
  font-weight: 500;
}

/* 深色主题下选中范围的特殊处理 */
:root.dark-theme .date-picker :deep(.el-date-table td.in-range) {
  background: rgba(96, 165, 250, 0.4) !important;
}

:root.dark-theme .date-picker :deep(.el-date-table td.in-range div) {
  color: #ffffff !important;
  font-weight: 600;
}

.date-picker :deep(.el-date-table td.start-date),
.date-picker :deep(.el-date-table td.end-date) {
  background: var(--accent-color) !important;
  color: white !important;
  font-weight: 700;
}

.date-picker :deep(.el-date-table td.start-date div),
.date-picker :deep(.el-date-table td.end-date div) {
  color: white !important;
  font-weight: 700;
}

/* 深色主题下选中范围的优化 - 使用半透明蓝色背景，纯白色文字 */
.date-picker :deep(.el-date-table td.in-range:not(.start-date):not(.end-date)) {
  background: rgba(96, 165, 250, 0.4) !important;
}

.date-picker :deep(.el-date-table td.in-range:not(.start-date):not(.end-date) div) {
  color: #ffffff !important;
  font-weight: 600;
}

.date-picker :deep(.el-date-table td.today) {
  color: var(--accent-color) !important;
  font-weight: 700;
}

.date-picker :deep(.el-date-table td.today div) {
  color: var(--accent-color) !important;
  font-weight: 700;
}

.date-picker :deep(.el-date-table td.today:not(.start-date):not(.end-date)) {
  background: transparent !important;
}

.date-picker :deep(.el-date-table td.disabled) {
  color: var(--text-disabled) !important;
  background: transparent !important;
}

.date-picker :deep(.el-date-table td.disabled div) {
  color: var(--text-disabled) !important;
}

.date-picker :deep(.el-date-table td.prev-month),
.date-picker :deep(.el-date-table td.next-month) {
  color: var(--text-tertiary) !important;
}

.date-picker :deep(.el-date-table td.prev-month div),
.date-picker :deep(.el-date-table td.next-month div) {
  color: var(--text-tertiary) !important;
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
  right: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
  flex-wrap: wrap;
}

.chart-unit {
  margin-left: auto;
  font-size: 10px;
  font-weight: 900;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
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

.legend-line {
  width: 16px;
  height: 2px;
  border-radius: 0;
  display: inline-block;
}

.legend-bar {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
}

.legend-line-count {
  background: #ec4899;
}

.legend-bar-cost {
  background: var(--accent-color);
}

.chart-container {
  flex: 1;
  position: relative;
  padding-top: 64px;
  min-height: 280px;
}

.echarts-chart {
  width: 100%;
  height: 100%;
  min-height: 220px;
}

.chart-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

.logs-section {
  margin-top: 48px;
}

.logs-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .logs-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.logs-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.logs-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  transition: color 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.logs-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  --el-select-width: 140px;
  --el-fill-color-blank: var(--bg-card);
  --el-fill-color: var(--bg-card);
  --el-border-color: var(--border-color);
  --el-text-color-primary: var(--text-primary);
  --el-text-color-placeholder: var(--text-tertiary);
}

.filter-select :deep(.el-input__wrapper),
.filter-select :deep(.el-input__wrapper.is-focus),
.filter-select :deep(.el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

/* 深色主题下强制覆盖 */
:root.dark-theme .filter-select :deep(.el-input__wrapper),
:root.dark-theme .filter-select :deep(.el-input__wrapper.is-focus),
:root.dark-theme .filter-select :deep(.el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

.filter-select :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-color) !important;
  background: var(--bg-card) !important;
}

.filter-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color) !important;
  background: var(--bg-card) !important;
  box-shadow: 0 0 0 1px var(--accent-color) inset !important;
}

.filter-select :deep(.el-input__inner) {
  color: var(--text-primary) !important;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: transparent !important;
}

.filter-select :deep(.el-input__inner::placeholder) {
  color: var(--text-tertiary) !important;
}

.filter-select :deep(.el-input__suffix) {
  color: var(--text-tertiary);
}

.filter-select :deep(.el-input__suffix:hover) {
  color: var(--accent-color);
}

/* 筛选器下拉选择器弹窗样式 */
.filter-select :deep(.el-select-dropdown) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-lg) !important;
}

.filter-select :deep(.el-select-dropdown__item) {
  color: var(--text-primary) !important;
  background: var(--bg-card) !important;
}

.filter-select :deep(.el-select-dropdown__item:hover) {
  background: var(--bg-hover) !important;
  color: var(--accent-color) !important;
}

.filter-select :deep(.el-select-dropdown__item.is-selected) {
  color: var(--accent-color) !important;
  background: rgba(147, 51, 234, 0.1) !important;
  font-weight: 600;
}

.filter-select :deep(.el-select-dropdown__item.is-disabled) {
  color: var(--text-disabled) !important;
}

.filter-date-picker {
  --el-date-editor-width: 280px;
  --el-fill-color-blank: var(--bg-card);
  --el-fill-color: var(--bg-card);
}

.filter-date-picker :deep(.el-input__wrapper),
.filter-date-picker :deep(.el-input__wrapper.is-focus),
.filter-date-picker :deep(.el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.filter-date-picker :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-color) !important;
  background: var(--bg-card) !important;
}

.filter-date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color) !important;
  background: var(--bg-card) !important;
  box-shadow: 0 0 0 1px var(--accent-color) inset !important;
}

.filter-date-picker :deep(.el-input__inner) {
  color: var(--text-primary) !important;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: transparent !important;
}

.filter-date-picker :deep(.el-input__inner::placeholder) {
  color: var(--text-tertiary) !important;
}

.filter-date-picker :deep(.el-input__suffix) {
  color: var(--text-tertiary);
}

.filter-date-picker :deep(.el-input__suffix:hover) {
  color: var(--accent-color);
}

.filter-date-picker :deep(.el-range-separator) {
  color: var(--text-secondary) !important;
}

/* 筛选器日期选择器弹窗样式（复用日期选择器的弹窗样式） */
.filter-date-picker :deep(.el-picker__popper) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-lg) !important;
}

.filter-date-picker :deep(.el-picker__popper .el-popper__arrow::before) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
}

.filter-date-picker :deep(.el-date-range-picker__header) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.filter-date-picker :deep(.el-date-range-picker__header button) {
  color: var(--text-primary) !important;
  background: transparent !important;
}

.filter-date-picker :deep(.el-date-range-picker__header button:hover) {
  color: var(--accent-color) !important;
  background: var(--bg-hover) !important;
}

.filter-date-picker :deep(.el-picker-panel) {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

.filter-date-picker :deep(.el-picker-panel__header-label) {
  color: var(--text-primary) !important;
}

.filter-date-picker :deep(.el-picker-panel__icon-btn) {
  color: var(--text-primary) !important;
}

.filter-date-picker :deep(.el-picker-panel__icon-btn:hover) {
  color: var(--accent-color) !important;
  background-color: var(--bg-hover) !important;
}

.filter-date-picker :deep(.el-date-table) {
  background-color: var(--bg-card) !important;
}

.filter-date-picker :deep(.el-date-table th) {
  color: var(--text-secondary) !important;
  border-color: var(--border-color) !important;
  background-color: var(--bg-card) !important;
}

.filter-date-picker :deep(.el-date-table td) {
  color: var(--text-primary) !important;
  background-color: transparent !important;
}

.filter-date-picker :deep(.el-date-table td div) {
  color: var(--text-primary) !important;
}

.filter-date-picker :deep(.el-date-table td.available) {
  color: var(--text-primary) !important;
}

.filter-date-picker :deep(.el-date-table td.available:hover) {
  background-color: var(--bg-hover) !important;
}

.filter-date-picker :deep(.el-date-table td.available:hover div) {
  color: var(--accent-color) !important;
}

.filter-date-picker :deep(.el-date-table td.current:not(.disabled)) {
  color: var(--accent-color) !important;
}

.filter-date-picker :deep(.el-date-table td.current:not(.disabled) div) {
  color: var(--accent-color) !important;
}

.filter-date-picker :deep(.el-date-table td.in-range) {
  background-color: rgba(96, 165, 250, 0.4) !important;
}

.filter-date-picker :deep(.el-date-table td.in-range div) {
  color: #ffffff !important;
  font-weight: 600;
}

.filter-date-picker :deep(.el-date-table td.in-range:not(.start-date):not(.end-date)) {
  background-color: rgba(96, 165, 250, 0.4) !important;
}

.filter-date-picker :deep(.el-date-table td.in-range:not(.start-date):not(.end-date) div) {
  color: #ffffff !important;
  font-weight: 600;
}

.filter-date-picker :deep(.el-date-table td.start-date),
.filter-date-picker :deep(.el-date-table td.end-date) {
  background-color: var(--accent-color) !important;
  color: white !important;
}

.filter-date-picker :deep(.el-date-table td.start-date div),
.filter-date-picker :deep(.el-date-table td.end-date div) {
  color: white !important;
}

.filter-date-picker :deep(.el-date-table td.today:not(.start-date):not(.end-date)) {
  color: var(--accent-color) !important;
  background-color: transparent !important;
}

.filter-date-picker :deep(.el-date-table td.today:not(.start-date):not(.end-date) div) {
  color: var(--accent-color) !important;
}

.filter-date-picker :deep(.el-date-table td.prev-month),
.filter-date-picker :deep(.el-date-table td.next-month) {
  color: var(--text-tertiary) !important;
}

.filter-date-picker :deep(.el-date-table td.disabled) {
  color: var(--text-disabled) !important;
  cursor: not-allowed;
}

.filter-date-picker :deep(.el-date-table td.disabled div) {
  color: var(--text-disabled) !important;
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

.empty-cell {
  text-align: center;
  padding: 120px 40px !important;
  color: var(--text-tertiary);
  font-size: 14px;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.custom-pagination :deep(.el-pagination) {
  --el-pagination-bg-color: var(--bg-card);
  --el-pagination-text-color: var(--text-primary);
  --el-pagination-border-radius: 12px;
  --el-pagination-button-color: var(--text-secondary);
  --el-pagination-hover-color: var(--accent-color);
  --el-pagination-active-color: var(--accent-color);
  --el-fill-color-blank: var(--bg-card);
  --el-fill-color: var(--bg-card);
  --el-border-color: var(--border-color);
  --el-text-color-primary: var(--text-primary);
  --el-text-color-placeholder: var(--text-tertiary);
}

.custom-pagination :deep(.el-pagination__total),
.custom-pagination :deep(.el-pagination__jump) {
  color: var(--text-secondary) !important;
  font-size: 12px;
  font-family: 'Inter', sans-serif;
}

.custom-pagination :deep(.el-pagination__jump .el-input__wrapper) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  padding: 4px 8px !important;
}

.custom-pagination :deep(.el-pagination__jump .el-input__inner) {
  color: var(--text-primary) !important;
  font-size: 12px !important;
  background: transparent !important;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next),
.custom-pagination :deep(.el-pager li) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover),
.custom-pagination :deep(.el-pager li:hover) {
  background: var(--bg-hover) !important;
  color: var(--accent-color) !important;
  border-color: var(--accent-color) !important;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background: var(--accent-color) !important;
  color: white !important;
  border-color: var(--accent-color) !important;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper),
.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper.is-focus),
.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  padding: 4px 8px !important;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper:hover) {
  border-color: var(--accent-color) !important;
}

/* 浅色主题下强制覆盖分页器选择框 */
:root.light-theme .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper),
:root.light-theme .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper.is-focus),
:root.light-theme .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper:hover),
:root:not(.dark-theme) .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper),
:root:not(.dark-theme) .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper.is-focus),
:root:not(.dark-theme) .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

/* 深色主题下强制覆盖分页器选择框 */
:root.dark-theme .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper),
:root.dark-theme .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper.is-focus),
:root.dark-theme .custom-pagination :deep(.el-pagination__sizes .el-select .el-input__wrapper:hover) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__inner) {
  color: var(--text-primary) !important;
  font-size: 12px !important;
  background: transparent !important;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__suffix) {
  color: var(--text-tertiary) !important;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-input__suffix:hover) {
  color: var(--accent-color) !important;
}

/* 分页器下拉选择器弹窗样式 */
.custom-pagination :deep(.el-select-dropdown) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: var(--shadow-lg) !important;
}

.custom-pagination :deep(.el-select-dropdown__item) {
  color: var(--text-primary) !important;
  background: var(--bg-card) !important;
}

.custom-pagination :deep(.el-select-dropdown__item:hover) {
  background: var(--bg-hover) !important;
  color: var(--accent-color) !important;
}

.custom-pagination :deep(.el-select-dropdown__item.is-selected) {
  color: #9333ea !important;
  background-color: rgba(147, 51, 234, 0.1) !important;
  background: rgba(147, 51, 234, 0.1) !important;
  font-weight: 600;
}

/* 浅色主题下选中项样式 - 使用更强的选择器 */
:root.light-theme .custom-pagination :deep(.el-select-dropdown__item.is-selected),
:root:not(.dark-theme) .custom-pagination :deep(.el-select-dropdown__item.is-selected),
:root.light-theme .el-select-dropdown__item.is-selected,
:root:not(.dark-theme) .el-select-dropdown__item.is-selected {
  color: #9333ea !important;
  background-color: rgba(147, 51, 234, 0.1) !important;
  background: rgba(147, 51, 234, 0.1) !important;
  font-weight: 600;
}

/* 深色主题下选中项样式 */
:root.dark-theme .custom-pagination :deep(.el-select-dropdown__item.is-selected),
:root.dark-theme .el-select-dropdown__item.is-selected {
  color: var(--accent-color) !important;
  background-color: rgba(96, 165, 250, 0.1) !important;
  background: rgba(96, 165, 250, 0.1) !important;
}
</style>
