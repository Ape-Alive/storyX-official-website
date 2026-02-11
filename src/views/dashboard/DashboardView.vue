<template>
  <div class="dashboard-view">
    <div class="stats-grid">
      <StatCard
        v-for="(stat, i) in stats"
        :key="i"
        :label="stat.label"
        :value="stat.value"
        :trend="stat.trend"
        :icon="stat.icon"
        :icon-bg-class="stat.bg"
        :icon-color-class="stat.color"
        :trend-class="stat.trend.includes('+') ? 'text-red-400' : 'text-green-500'"
      />
    </div>

    <div class="hero-banner">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>

      <div class="hero-info">
        <span class="hero-meta">
          <span class="status-dot"></span>
          实时监看 00:24:59:12
        </span>
        <span>快门: 1/50</span>
        <span>色温: 5600K</span>
      </div>

      <h1 class="hero-title">定制您的</h1>
      <h2 class="hero-subtitle">
        <span class="gradient-text">制片权限</span>
      </h2>

      <div class="hero-footer">
        <span>AF-C [多智能体并行系统]</span>
        <span class="divider">|</span>
        <span>状态: 最佳运行</span>
      </div>
    </div>

    <div class="content-grid">
      <div class="plans-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">活跃套餐监控</h3>
            <p class="section-desc">{{ statusDesc }}</p>
          </div>
          <router-link to="/dashboard/plans" class="buy-btn">
            <el-icon :size="16"><Plus /></el-icon>
            购买新额度
          </router-link>
        </div>

        <div v-loading="loading" class="plans-list">
          <PlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
          />
          <div v-if="!loading && plans.length === 0" class="empty-plans">
            <div class="empty-icon">
              <el-icon :size="48" color="var(--text-tertiary)"><CreditCard /></el-icon>
            </div>
            <h4 class="empty-title">暂无活跃套餐</h4>
            <p class="empty-desc">购买套餐后，您可以开始使用我们的服务</p>
            <router-link to="/dashboard/plans" class="empty-link">
              <el-icon :size="16"><Plus /></el-icon>
              立即购买套餐
            </router-link>
          </div>
        </div>
      </div>

      <router-link to="/dashboard/plans" class="upgrade-card">
        <div class="upgrade-icon">
          <el-icon :size="24"><Plus /></el-icon>
        </div>
        <h3 class="upgrade-title">快速购买</h3>
        <p class="upgrade-desc">
          {{ plans.length === 0 ? '立即购买套餐，开启您的创作之旅' : '购买更多额度，提升您的创作能力' }}
        </p>
        <div class="upgrade-btn">前往购买</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Lightning, Lock, CreditCard, TrendCharts, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StatCard from '@/components/dashboard/StatCard.vue'
import PlanCard from '@/components/dashboard/PlanCard.vue'
import { getMyPackages } from '@/api/pricing'

const stats = [
  { label: '今日调用量', value: '1,284', trend: '+12.5%', icon: Lightning, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { label: '平均成功率', value: '99.8%', trend: '稳定', icon: Lock, color: 'text-green-500', bg: 'bg-green-50' },
  { label: '今日估算费用', value: '¥24.50', trend: '+5.2%', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'API 响应均值', value: '120ms', trend: '-10ms', icon: TrendCharts, color: 'text-blue-500', bg: 'bg-blue-50' }
]

const plans = ref([])
const loading = ref(false)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 转换 API 数据为 PlanCard 需要的格式
const transformPlanData = (myPackage) => {
  const pkg = myPackage.package || {}
  const quotaInfo = myPackage.quotaInfo || {}
  
  const total = quotaInfo.total || 0
  const used = quotaInfo.used || 0
  const remaining = quotaInfo.remaining || 0
  
  // 计算消耗率
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0
  
  // 判断状态：如果消耗率 >= 80%，显示警告状态
  const status = percentage >= 80 ? 'warning' : 'active'
  
  // 格式化有效期：如果 expiresAt 为 null，显示空字符串（PlanCard 会显示"永久"）
  // 否则显示格式化的日期
  const expiry = myPackage.expiresAt ? formatDate(myPackage.expiresAt) : ''
  
  return {
    id: myPackage.id,
    name: pkg.displayName || pkg.name || '未知套餐',
    status: status,
    limit: total, // 总限额（字符数）
    used: used, // 已使用（字符数）
    expiry: expiry, // 有效期日期字符串，如果为空则 PlanCard 会显示"永久"
    price: pkg.price || 0,
    isCurrent: myPackage.status === 'active'
  }
}

// 加载我的套餐列表
const loadMyPackages = async () => {
  try {
    loading.value = true
    const response = await getMyPackages({ activeOnly: true })
    
    if (response.success && response.data) {
      // 只显示活跃套餐（status === 'active'）
      const activePackages = response.data.filter(pkg => pkg.status === 'active')
      
      // 转换为 PlanCard 需要的格式
      plans.value = activePackages.map(transformPlanData)
      
      // 如果没有活跃套餐，更新描述文字
      if (activePackages.length === 0) {
        // 可以在这里更新 section-desc 的文字
      }
    }
  } catch (error) {
    console.error('加载套餐失败:', error)
    ElMessage.error('加载套餐信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 计算总体状态描述
const statusDesc = computed(() => {
  if (plans.value.length === 0) {
    return '暂无活跃套餐'
  }
  
  // 检查是否有警告状态的套餐
  const hasWarning = plans.value.some(p => p.status === 'warning')
  if (hasWarning) {
    return '部分套餐额度即将用完，请及时续费'
  }
  
  return '目前您的算力配额运行状态良好'
})

// 组件挂载时加载数据
onMounted(() => {
  loadMyPackages()
})
</script>

<style scoped>
.dashboard-view {
  animation: fadeInSlide 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: var(--text-primary);
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.hero-banner {
  position: relative;
  padding: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 48px;
  box-shadow: var(--shadow-md);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.corner {
  position: absolute;
  width: 64px;
  height: 64px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.corner-tl {
  top: 32px;
  left: 32px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 24px;
}

.corner-tr {
  top: 32px;
  right: 32px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 24px;
}

.corner-bl {
  bottom: 32px;
  left: 32px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 24px;
}

.corner-br {
  bottom: 32px;
  right: 32px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 24px;
}

.hero-info {
  display: flex;
  gap: 16px;
  font-size: 10px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 24px;
  transition: color 0.3s ease;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s infinite;
}


@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: 48px;
  font-weight: 900;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  font-family: 'Space Grotesk', sans-serif;
}

.hero-subtitle {
  font-size: 64px;
  font-weight: 300;
  font-style: italic;
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
}

.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}

.hero-footer {
  margin-top: 32px;
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
}

.divider {
  color: var(--text-tertiary);
  transition: color 0.3s ease;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  align-items: stretch;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.plans-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 32px;
  padding: 32px;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.section-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.buy-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(147, 51, 234, 0.1);
  color: var(--accent-color);
  transition: color 0.3s ease;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
}

.buy-btn:hover {
  background: rgba(147, 51, 234, 0.15);
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.empty-plans {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: 300px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.empty-icon {
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.empty-desc {
  margin: 0 0 32px 0;
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.empty-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-gradient);
  color: white;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.empty-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
}

.upgrade-card {
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upgrade-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(147, 51, 234, 0.3);
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.upgrade-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-family: 'Space Grotesk', sans-serif;
}

.upgrade-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 32px 0;
  flex: 1;
  font-family: 'Inter', sans-serif;
}

.upgrade-btn {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  transition: background-color 0.3s ease;
  color: var(--accent-color);
  border-radius: 16px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(147, 51, 234, 0.4);
  font-family: 'Inter', sans-serif;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upgrade-card:hover .upgrade-btn {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 12px 40px rgba(147, 51, 234, 0.5);
}
</style>
