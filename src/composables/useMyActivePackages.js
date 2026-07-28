import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyPackages } from '@/api/pricing'

export function formatQuota(n) {
  const num = Number(n) || 0
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(num)
}

export function planPercentage(plan) {
  const total = Number(plan.limit) || 0
  const used = Number(plan.used) || 0
  if (total <= 0) return 0
  return Math.min(100, Math.round((used / total) * 100))
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const transformPlanData = (myPackage) => {
  const pkg = myPackage.package || {}
  const quotaInfo = myPackage.quotaInfo || {}
  const total = Number(quotaInfo.total) || 0
  const used = Number(quotaInfo.used) || 0
  // 与后台口径一致：可用 = available + frozen（优先 remaining）
  const remaining =
    quotaInfo.remaining != null
      ? Number(quotaInfo.remaining) || 0
      : Math.max(total - used, 0)
  const percentage = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0

  return {
    id: myPackage.id,
    name: pkg.displayName || pkg.name || '未知套餐',
    status: percentage >= 80 ? 'warning' : 'active',
    limit: total,
    used,
    remaining,
    expiry: myPackage.expiresAt ? formatDate(myPackage.expiresAt) : '',
    price: pkg.price || 0,
    isCurrent: myPackage.status === 'active'
  }
}

export function useMyActivePackages({ immediate = true } = {}) {
  const plans = ref([])
  const loading = ref(false)

  const loadMyPackages = async () => {
    try {
      loading.value = true
      const response = await getMyPackages({ activeOnly: true })
      if (response.success && response.data) {
        plans.value = response.data
          .filter((pkg) => pkg.status === 'active')
          .map(transformPlanData)
      } else {
        plans.value = []
      }
    } catch (error) {
      console.error('加载套餐失败:', error)
      ElMessage.error('加载套餐信息失败，请稍后重试')
      plans.value = []
    } finally {
      loading.value = false
    }
  }

  const statusDesc = computed(() => {
    if (plans.value.length === 0) return '暂无活跃套餐'
    if (plans.value.some((p) => p.status === 'warning')) {
      return '部分套餐额度即将用完，请及时续费'
    }
    return '目前您的算力配额运行状态良好'
  })

  if (immediate) {
    onMounted(loadMyPackages)
  }

  return {
    plans,
    loading,
    statusDesc,
    loadMyPackages,
    formatQuota,
    planPercentage
  }
}
