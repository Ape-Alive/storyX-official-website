import { Lightning, Lock, CreditCard, TrendCharts } from '@element-plus/icons-vue'

/** 控制台概览指标卡片元数据（数值由接口填充） */
export const dashboardStatMeta = [
  {
    key: 'totalConsumedPoints',
    label: '消耗总积分',
    icon: Lightning,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50'
  },
  {
    key: 'totalAvailablePoints',
    label: '套餐可用总积分',
    icon: Lock,
    color: 'text-green-500',
    bg: 'bg-green-50'
  },
  {
    key: 'todayCallCount',
    label: '今日调用次数',
    icon: CreditCard,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    key: 'totalCallCount',
    label: '累计调用次数',
    icon: TrendCharts,
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  }
]

export function formatDashboardNumber(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '--'
  const abs = Math.abs(num)
  if (abs >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (abs >= 1000) return `${(num / 1000).toFixed(1)}k`
  if (Number.isInteger(num)) return num.toLocaleString('en-US')
  if (abs > 0 && abs < 0.01) return num.toFixed(4)
  return num.toFixed(2)
}

export function formatChangePercent(percent) {
  const num = Number(percent)
  if (!Number.isFinite(num)) return ''
  if (num === 0) return '持平'
  const sign = num > 0 ? '+' : ''
  return `${sign}${num}%`
}

/**
 * 将接口数据映射为卡片展示结构
 * @param {object|null} data
 */
export function mapDashboardStats(data = {}) {
  const safe = data && typeof data === 'object' ? data : {}
  return dashboardStatMeta.map((meta) => {
    let trend = ''
    if (meta.key === 'totalAvailablePoints') {
      trend = '可用'
    } else if (meta.key === 'totalCallCount') {
      trend = '累计'
    } else if (meta.key === 'todayCallCount') {
      trend = formatChangePercent(safe.todayCallCountChangePercent)
    } else if (meta.key === 'totalConsumedPoints') {
      trend = '累计消耗'
    }

    return {
      label: meta.label,
      value: formatDashboardNumber(safe[meta.key] ?? 0),
      trend,
      icon: meta.icon,
      color: meta.color,
      bg: meta.bg
    }
  })
}

/** 加载失败或未请求时的占位 */
export const emptyDashboardStats = mapDashboardStats({})

/** @deprecated 兼容旧引用 */
export const dashboardStats = emptyDashboardStats
