<template>
  <div class="dashboard-view" :class="{ 'is-mobile': isMobile }">
    <!-- 顶部数据 -->
    <div class="stats-grid" v-loading="statsLoading">
      <template v-if="isMobile">
        <van-cell-group inset class="mobile-stats-group">
          <van-cell
            v-for="(stat, i) in stats"
            :key="i"
            :title="stat.label"
            :value="stat.value"
            :label="stat.trend"
          >
            <template #icon>
              <div class="mobile-stat-icon" :class="stat.bg">
                <el-icon :size="18" :class="stat.color">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
            </template>
            <template #right-icon>
              <span
                class="mobile-stat-trend"
                :class="stat.trend?.includes('+') ? 'is-up' : 'is-down'"
              >
                {{ stat.trend }}
              </span>
            </template>
          </van-cell>
        </van-cell-group>
      </template>
      <template v-else>
        <StatCard
          v-for="(stat, i) in stats"
          :key="i"
          :label="stat.label"
          :value="stat.value"
          :trend="stat.trend"
          :icon="stat.icon"
          :icon-bg-class="stat.bg"
          :icon-color-class="stat.color"
          :trend-class="stat.trend?.includes('+') ? 'text-red-400' : 'text-green-500'"
        />
      </template>
    </div>

    <!-- 桌面端 Hero（移动端隐藏） -->
    <div v-if="!isMobile" class="hero-banner">
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

    <div class="content-grid" :class="{ 'is-mobile-content': isMobile }">
      <div class="plans-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">活跃套餐监控</h3>
            <p class="section-desc">{{ statusDesc }}</p>
          </div>
          <van-button
            v-if="isMobile"
            type="primary"
            size="small"
            round
            icon="plus"
            to="/dashboard/plans"
          >
            购买
          </van-button>
          <router-link v-else to="/dashboard/plans" class="buy-btn">
            <el-icon :size="16"><Plus /></el-icon>
            购买新额度
          </router-link>
        </div>

        <div v-loading="loading" class="plans-list">
          <template v-if="isMobile">
            <van-empty
              v-if="!loading && plans.length === 0"
              image="search"
              description="暂无活跃套餐"
            >
              <van-button round type="primary" size="small" to="/dashboard/plans">
                立即购买套餐
              </van-button>
            </van-empty>
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="mobile-plan-card"
              :class="{ 'is-warning': plan.status === 'warning' }"
            >
              <div class="mobile-plan-top">
                <div>
                  <div class="mobile-plan-name">{{ plan.name }}</div>
                  <div class="mobile-plan-expiry">
                    {{ plan.expiry ? `有效期至 ${plan.expiry}` : '永久有效' }}
                  </div>
                </div>
                <van-tag v-if="plan.status === 'warning'" type="warning" round>
                  额度将尽
                </van-tag>
                <van-tag v-else type="success" plain round>使用中</van-tag>
              </div>
              <van-progress
                :percentage="planPercentage(plan)"
                :stroke-width="8"
                :color="plan.status === 'warning' ? '#f59e0b' : '#9333ea'"
                track-color="rgba(28,25,23,0.06)"
                pivot-text=""
              />
              <div class="mobile-plan-stats">
                <span>已用 {{ formatQuota(plan.used) }}</span>
                <span>剩余 {{ formatQuota(plan.remaining ?? Math.max((plan.limit || 0) - (plan.used || 0), 0)) }}</span>
              </div>
            </div>
          </template>
          <template v-else>
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
          </template>
        </div>
      </div>

      <router-link v-if="!isMobile" to="/dashboard/plans" class="upgrade-card">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, Plus } from '@element-plus/icons-vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import PlanCard from '@/components/dashboard/PlanCard.vue'
import { emptyDashboardStats, mapDashboardStats } from '@/config/dashboardStats'
import { useMyActivePackages, formatQuota, planPercentage } from '@/composables/useMyActivePackages'
import { getDashboardStats } from '@/api/usage'
import { useDevice } from '@/utils/device'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'

const router = useRouter()
const { isMobile } = useDevice()
const { runPageBoot, finishPageBoot } = useDashboardPageBoot()
const stats = ref([...emptyDashboardStats])
const statsLoading = ref(false)
const {
  plans,
  loading,
  statusDesc,
  loadMyPackages
} = useMyActivePackages({ immediate: false })

const loadStats = async () => {
  try {
    statsLoading.value = true
    const response = await getDashboardStats()
    if (response.success && response.data) {
      stats.value = mapDashboardStats(response.data)
    } else {
      stats.value = mapDashboardStats({})
    }
  } catch (error) {
    console.error('加载概览指标失败:', error)
    stats.value = mapDashboardStats({})
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  if (isMobile.value) {
    finishPageBoot()
    router.replace('/dashboard/usage')
    return
  }
  runPageBoot(() => Promise.allSettled([loadMyPackages(), loadStats()]))
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

.mobile-stats-group {
  margin: 0 !important;
}

.mobile-stats-group :deep(.van-cell) {
  align-items: center;
  padding: 14px 16px;
}

.mobile-stats-group :deep(.van-cell__title) {
  font-size: 12px;
  color: var(--text-tertiary);
}

.mobile-stats-group :deep(.van-cell__label) {
  display: none;
}

.mobile-stats-group :deep(.van-cell__value) {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.mobile-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.mobile-stat-trend {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 700;
}

.mobile-stat-trend.is-up {
  color: #f87171;
}

.mobile-stat-trend.is-down {
  color: #22c55e;
}

.bg-yellow-50 { background: #fefce8; }
.bg-green-50 { background: #f0fdf4; }
.bg-purple-50 { background: #faf5ff; }
.bg-blue-50 { background: #eff6ff; }
.text-yellow-500 { color: #eab308; }
.text-green-500 { color: #22c55e; }
.text-purple-600 { color: #9333ea; }
.text-blue-500 { color: #3b82f6; }

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
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
}

.gradient-text {
  background: linear-gradient(135deg, #9333ea, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-footer {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.divider {
  opacity: 0.4;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

.content-grid.is-mobile-content {
  grid-template-columns: 1fr;
  gap: 0;
}

.plans-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
}

.section-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.buy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 999px;
  background: #1c1917;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 80px;
}

.mobile-plan-card {
  padding: 14px;
  border-radius: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}

.mobile-plan-card.is-warning {
  border-color: rgba(245, 158, 11, 0.35);
}

.mobile-plan-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.mobile-plan-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.mobile-plan-expiry {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.mobile-plan-stats {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.empty-plans {
  text-align: center;
  padding: 40px 16px;
}

.empty-title {
  margin: 12px 0 6px;
  font-size: 16px;
}

.empty-desc {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.empty-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 600;
}

.upgrade-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 28px 24px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.upgrade-card:hover {
  border-color: rgba(147, 51, 234, 0.3);
  transform: translateY(-2px);
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(147, 51, 234, 0.1);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.upgrade-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.upgrade-btn {
  margin-top: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--accent-color);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.dashboard-view.is-mobile {
  gap: 12px;
}

.dashboard-view.is-mobile .mobile-stats-group :deep(.van-cell) {
  padding: 12px 14px;
}

.dashboard-view.is-mobile .plans-section {
  padding: 14px;
  border-radius: 16px;
}

.dashboard-view.is-mobile .section-title {
  font-size: 17px;
}

.dashboard-view.is-mobile .section-header {
  margin-bottom: 10px;
}

.dashboard-view.is-mobile .stats-grid {
  grid-template-columns: 1fr;
  gap: 0;
}
</style>
