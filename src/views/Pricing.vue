<template>
  <div class="pricing-page">
    <div class="pricing-container">
      <!-- Badge -->
      <div class="pricing-badge">
        <el-icon :size="12" color="#4f46e5" class="badge-icon">
          <Star />
        </el-icon>
        灵活多样的制片体系
      </div>

      <!-- 主标题区域（取景框样式） -->
      <div class="pricing-header-wrapper">
        <div class="title-frame">
          <!-- 取景框边角 -->
          <div class="frame-corner frame-corner-tl"></div>
          <div class="frame-corner frame-corner-tr"></div>
          <div class="frame-corner frame-corner-bl"></div>
          <div class="frame-corner frame-corner-br"></div>

          <!-- 技术细节标注 -->
          <div class="camera-info camera-info-tl">
            <span class="rec-dot"></span>
            REC 00:24:59:12
          </div>
          <div class="camera-info camera-info-tr">
            4K 60FPS ISO 400
          </div>
          <div class="camera-info camera-info-bl">
            AF-C [MULTI-AGENT]
          </div>

          <!-- 主标题 -->
          <div class="title-content">
            <h1 class="pricing-title-main">定制您的</h1>
            <div class="pricing-title-gradient-wrapper">
              <span class="pricing-title-gradient">制片权限</span>
              <div class="title-underline"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订阅时长选择器 -->
      <div class="duration-selector-wrapper">
        <div class="duration-selector">
          <button
            v-for="duration in durations"
            :key="duration.value"
            :class="['duration-btn', { active: selectedDuration === duration.value }]"
            @click="selectedDuration = duration.value"
          >
            <span>{{ duration.label }}</span>
            <span v-if="duration.discount" class="discount-badge">{{ duration.discount }}</span>
          </button>
        </div>
      </div>

      <!-- 套餐卡片（横向滚动） -->
      <div class="packages-scroll-wrapper">
        <div
          class="packages-scroll-container"
          ref="scrollContainerRef"
          :class="{ 'center-cards': filteredPackages.length <= 2 }"
        >
          <div
            v-for="(pkg, index) in filteredPackages"
            :key="pkg.id"
            :class="['package-card', { recommended: index === 1 }]"
          >
            <div class="package-inner">
              <div v-if="index === 1" class="recommended-badge">推荐选择</div>

              <div class="package-header">
                <h3 class="package-name">{{ pkg.displayName }}</h3>
                <div class="package-price">
                  <span class="price-amount">¥{{ formatPrice(pkg.displayPrice) }}</span>
                  <span class="price-unit">/{{ getDurationUnitLabel() }}</span>
                </div>
                <p class="package-desc">{{ pkg.description }}</p>
              </div>

              <div class="package-metrics">
                <div class="metric-item metric-item-blue">
                  <span class="metric-label">积分额度</span>
                  <span class="metric-value">{{ formatQuota(pkg.quota) }}</span>
                </div>
                <div class="metric-item metric-item-purple">
                  <span class="metric-label">多端登录</span>
                  <span class="metric-value">{{ pkg.maxDevices ? `${pkg.maxDevices}台` : '不限制' }}</span>
                </div>
              </div>

              <ul class="package-features">
                <li v-for="feature in pkg.features" :key="feature" class="feature-item">
                  <div :class="['feature-check', { 'check-popular': index === 1 }]">
                    <el-icon :size="10" :color="index === 1 ? '#fff' : '#4f46e5'"><Select /></el-icon>
                  </div>
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <button
                :class="['subscribe-btn', { 'btn-popular': index === 1 }]"
                @click="handleSubscribe(pkg)"
              >
                {{ getButtonText() }}
              </button>
            </div>
          </div>

          <!-- 定制方案卡片 -->
          <div class="package-card custom-card">
            <div class="package-inner custom-inner">
              <div class="custom-icon">
                <el-icon :size="36" color="#4f46e5"><Plus /></el-icon>
              </div>
              <h4 class="custom-title">定制方案</h4>
              <p class="custom-desc">需要算力算集群<br/>或独立服务器部署？</p>
              <div class="custom-link">
                联系我们
                <el-icon :size="14" color="#4f46e5"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 滚动提示（只在有3个或更多卡片时显示） -->
        <div v-if="filteredPackages.length > 2" class="scroll-hint">
          <div class="scroll-hint-icon">
            <el-icon :size="24" color="#6366f1"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 底部信息卡片 -->
      <div class="pricing-footer">
        <div class="footer-card">
          <div class="footer-icon">
            <el-icon :size="24" color="#4f46e5"><Lock /></el-icon>
          </div>
          <h4>权益即时生效</h4>
          <p>订阅成功后，AI 算力与导出权限实时同步到您的所有设备。</p>
        </div>
        <div class="footer-card">
          <div class="footer-icon">
            <el-icon :size="24" color="#4f46e5"><CreditCard /></el-icon>
          </div>
          <h4>安全支付保障</h4>
          <p>支持主流支付渠道，计费透明，提供标准化电子发票申请。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Select, Loading, Lock, CreditCard, Star, Plus, ArrowRight } from '@element-plus/icons-vue'
import { getAvailablePackages } from '@/api/pricing'

const scrollContainerRef = ref(null)

const durations = [
  { value: 'day', label: '按天' },
  { value: 'month', label: '按月' },
  { value: 'year', label: '按年', discount: '省20%' },
  { value: 'permanent', label: '永久' }
]

const selectedDuration = ref('month')
const packages = ref([])
const loading = ref(true)

// 根据时长筛选套餐
const filteredPackages = computed(() => {
  return packages.value
    .filter(pkg => {
      if (selectedDuration.value === 'permanent') {
        return !pkg.durationUnit
      }
      return pkg.durationUnit === selectedDuration.value
    })
    .map((pkg, index) => ({
      ...pkg,
      isRecommended: index === 1,
      displayPrice: calculatePrice(pkg),
      features: getPackageFeatures(pkg)
    }))
})

// 计算显示价格（考虑折扣）
const calculatePrice = (pkg) => {
  // 处理价格，支持字符串和数字类型
  if (pkg.price === null || pkg.price === undefined || pkg.price === '') {
    return 0
  }

  // 转换为数字
  let price = typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price

  // 如果转换失败，返回 0
  if (isNaN(price)) {
    return 0
  }

  // 按年订阅时，如果 API 返回的年付套餐价格已经是最终价格，则不需要再应用折扣
  // discount 字段可能表示其他含义（如免费标识），不应该直接用于价格计算
  // 只有当明确需要应用年付折扣时，才使用固定的折扣率（如20%）
  // 这里暂时移除 discount 字段的应用，直接使用 API 返回的价格
  // 如果未来需要应用年付折扣，应该使用固定的折扣率，而不是 discount 字段

  // 返回数字类型，让 formatPrice 函数处理显示格式
  return price
}

// 格式化额度
const formatQuota = (quota) => {
  if (!quota && quota !== 0) return '无限'
  const quotaNum = typeof quota === 'string' ? parseFloat(quota) : quota
  if (isNaN(quotaNum)) return '无限'
  if (quotaNum >= 1000) {
    return `${(quotaNum / 1000).toFixed(0)}K点`
  }
  return `${quotaNum}点`
}

// 格式化价格显示
const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  const priceNum = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(priceNum)) return '0'

  // 如果价格小于 1，保留一位小数；否则显示整数
  if (priceNum < 1 && priceNum > 0) {
    return priceNum.toFixed(1)
  }

  return Math.round(priceNum).toString()
}

// 获取时长单位标签
const getDurationUnitLabel = () => {
  const map = {
    day: '天',
    month: '月',
    year: '年',
    permanent: '永久'
  }
  return map[selectedDuration.value] || '月'
}

// 获取按钮文本
const getButtonText = () => {
  const map = {
    day: '立即订阅',
    month: '订阅按月版',
    year: '订阅按年版',
    permanent: '永久买断'
  }
  return map[selectedDuration.value] || '立即订阅'
}

// 获取套餐特性列表
const getPackageFeatures = (pkg) => {
  const features = []

  if (pkg.quota) {
    if (pkg.quota <= 1000) {
      features.push('2K 画质导出')
      features.push('角色一致性引擎')
      features.push('云端项目备份')
    } else if (pkg.quota <= 5000) {
      features.push('4K 原生渲染')
      features.push('多智能体协作流')
      features.push('自定义配音模型')
      features.push('专属水印定制')
    } else {
      features.push('团队共享额度')
      features.push('项目权限分发')
      features.push('ProRes 无损导出')
    }
  }

  return features
}

// 加载套餐数据
const loadPackages = async () => {
  try {
    loading.value = true
    const response = await getAvailablePackages('paid')
    if (response.success && response.data) {
      packages.value = response.data
    }
  } catch (error) {
    console.error('加载套餐失败:', error)
    ElMessage.error('加载套餐信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 订阅处理
const handleSubscribe = (pkg) => {
  ElMessage.info(`正在跳转到订阅页面：${pkg.displayName}`)
}

onMounted(() => {
  loadPackages()
})
</script>

<style scoped>
/* 页面基础样式 */
.pricing-page {
  min-height: 100vh;
  background: linear-gradient(to right, #faf5ff, #ffffff);
  color: #1e1b4b;
  padding-top: 80px;
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰 */
.pricing-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
  background-size: 100% 100%;
}

.pricing-page::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.25;
  background-image: radial-gradient(rgba(156, 163, 175, 0.3) 1px, transparent 0);
  background-size: 64px 64px;
  mix-blend-mode: multiply;
}

.pricing-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 120px 32px 120px;
  position: relative;
  z-index: 10;
}

/* Badge */
.pricing-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.2);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  color: #4f46e5;
}

.badge-icon {
  margin-right: 8px;
  animation: spin-slow 12s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 标题框架 */
.pricing-header-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 96px;
}

.title-frame {
  position: relative;
  padding: 80px 60px;
  transition: all 0.7s;
}

.title-frame:hover .frame-corner {
  width: 80px;
  height: 80px;
}

/* 取景框边角 */
.frame-corner {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 2px solid rgba(99, 102, 241, 0.4);
  transition: all 0.5s;
}

.frame-corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 24px;
}

.frame-corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 24px;
}

.frame-corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 24px;
}

.frame-corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 24px;
}

/* 相机信息标注 */
.camera-info {
  position: absolute;
  font-size: 9px;
  font-weight: 900;
  color: rgba(99, 102, 241, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Courier New', monospace;
}

.camera-info-tl {
  top: 16px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rec-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.camera-info-tr {
  top: 16px;
  right: 40px;
}

.camera-info-bl {
  bottom: 16px;
  left: 40px;
}

/* 标题内容 */
.title-content {
  position: relative;
  text-align: center;
}

.pricing-title-main {
  font-size: 96px;
  font-weight: 900;
  letter-spacing: -0.05em;
  margin-bottom: 16px;
  color: #1e1b4b;
  line-height: 1;
  font-family: 'Space Grotesk', sans-serif;
}

@media (min-width: 768px) {
  .pricing-title-main {
    font-size: 128px;
  }
}

.pricing-title-gradient-wrapper {
  position: relative;
  display: inline-block;
}

.pricing-title-gradient {
  font-size: 80px;
  font-weight: 300;
  letter-spacing: 0.2em;
  font-style: italic;
  background: linear-gradient(to right, #4f46e5, #9333ea, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  font-family: 'Space Grotesk', sans-serif;
}

@media (min-width: 768px) {
  .pricing-title-gradient {
    font-size: 128px;
  }
}

.title-underline {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(99, 102, 241, 0.2), transparent);
}

/* 时长选择器 */
.duration-selector-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 64px;
}

.duration-selector {
  background: rgba(255, 255, 255, 0.4);
  padding: 6px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.1);
}

.duration-btn {
  position: relative;
  padding: 14px 32px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: none;
  background: transparent;
  color: rgba(99, 102, 241, 0.3);
  cursor: pointer;
  transition: all 0.5s;
  font-family: 'Inter', sans-serif;
}

.duration-btn:hover {
  color: #4f46e5;
  background: rgba(255, 255, 255, 0.4);
}

.duration-btn.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: -12px;
  right: -8px;
  background: #ec4899;
  color: white;
  font-size: 7px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 9999px;
  box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);
}

/* 套餐滚动容器 */
.packages-scroll-wrapper {
  position: relative;
  margin-bottom: 80px;
  padding: 16px 4px 64px;
}

.packages-scroll-container {
  display: flex;
  gap: 40px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 4px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 当只有1-2个卡片时居中显示 */
.packages-scroll-container.center-cards {
  justify-content: center;
  overflow-x: visible;
}

/* 当有3个或更多卡片时保持横向滚动 */
.packages-scroll-container:not(.center-cards) {
  justify-content: flex-start;
}

.packages-scroll-container::-webkit-scrollbar {
  display: none;
}

/* 套餐卡片 */
.package-card {
  position: relative;
  flex-shrink: 0;
  width: 380px;
  padding: 4px;
  border-radius: 56px;
  transition: all 0.7s;
  background: white;
  border: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.1);
}

.package-card:hover {
  transform: scale(1.02);
  box-shadow: 0 25px 30px -5px rgba(99, 102, 241, 0.15);
}

.package-card.recommended {
  background: linear-gradient(to bottom, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4));
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.25);
  border: none;
}

.package-card.recommended:hover {
  box-shadow: 0 30px 60px -12px rgba(99, 102, 241, 0.35);
}

.package-inner {
  position: relative;
  background: white;
  border-radius: 54px;
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.package-card.recommended .package-inner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px);
}

.recommended-badge {
  position: absolute;
  top: 32px;
  right: 32px;
  background: #4f46e5;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 4px 16px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.package-header {
  margin-bottom: 32px;
  text-align: left;
}

.package-name {
  font-size: 22px;
  font-weight: 900;
  color: #1e1b4b;
  margin-bottom: 12px;
  text-transform: none;
  letter-spacing: -0.01em;
  font-family: 'Inter', sans-serif;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 20px;
}

.price-amount {
  font-size: 56px;
  font-weight: 900;
  color: #1e1b4b;
  letter-spacing: -0.05em;
  font-family: 'Space Grotesk', sans-serif;
  line-height: 1;
}

.price-unit {
  font-size: 16px;
  font-weight: 600;
  color: rgba(30, 27, 75, 0.5);
  margin-left: 2px;
}

.package-desc {
  font-size: 13px;
  color: rgba(30, 27, 75, 0.6);
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 0;
}

/* 指标卡片 */
.package-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.metric-item {
  padding: 16px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid;
  transition: all 0.3s;
}

.metric-item:hover {
  transform: translateY(-2px);
}

.metric-item-blue {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.15);
}

.metric-item-purple {
  background: rgba(168, 85, 247, 0.08);
  border-color: rgba(168, 85, 247, 0.15);
}

.metric-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(99, 102, 241, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.metric-item-purple .metric-label {
  color: rgba(168, 85, 247, 0.7);
}

.metric-value {
  font-size: 16px;
  font-weight: 900;
  color: #1e1b4b;
  font-family: 'Space Grotesk', sans-serif;
}

/* 特性列表 */
.package-features {
  list-style: none;
  padding: 0;
  margin: 0 0 40px 0;
  flex: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  transition: color 0.3s;
}

.feature-item:hover {
  color: #1e1b4b;
}

.feature-check {
  margin-top: 2px;
  padding: 2px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-popular {
  background: #4f46e5;
}

.feature-item span {
  font-size: 13px;
  font-weight: 600;
  color: rgba(30, 27, 75, 0.75);
  line-height: 1.6;
  transition: color 0.3s;
}

.feature-item:hover span {
  color: #1e1b4b;
}

/* 订阅按钮 */
.subscribe-btn {
  width: 100%;
  padding: 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.subscribe-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(99, 102, 241, 0.2);
}

.subscribe-btn:active {
  transform: scale(0.98);
}

.btn-popular {
  background: #4f46e5;
  color: white;
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3);
}

.btn-popular:hover {
  background: #4338ca;
  box-shadow: 0 25px 30px -5px rgba(79, 70, 229, 0.4);
  transform: translateY(-3px);
}

/* 定制方案卡片 */
.custom-card {
  border: 2px dashed rgba(99, 102, 241, 0.2);
  background: rgba(237, 233, 254, 0.5);
  box-shadow: none;
}

.custom-card:hover {
  background: rgba(237, 233, 254, 0.7);
  border-color: rgba(99, 102, 241, 0.4);
  transform: scale(1.02);
}

.custom-inner {
  background: transparent;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 40px;
}

.custom-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.15);
  transition: transform 0.3s;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.custom-card:hover .custom-icon {
  transform: scale(1.1);
  box-shadow: 0 25px 30px -5px rgba(99, 102, 241, 0.2);
}

.custom-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e1b4b;
  margin-bottom: 12px;
  text-transform: none;
  letter-spacing: -0.01em;
  font-family: 'Inter', sans-serif;
}

.custom-desc {
  font-size: 12px;
  color: rgba(99, 102, 241, 0.6);
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.02em;
  line-height: 1.6;
  margin-bottom: 32px;
}

.custom-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  text-transform: none;
  letter-spacing: 0.05em;
  transition: all 0.3s;
  cursor: pointer;
}

.custom-card:hover .custom-link {
  gap: 12px;
  color: #4338ca;
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(16px);
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.packages-scroll-wrapper:hover .scroll-hint {
  opacity: 1;
}

.scroll-hint-icon {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 12px;
  border-radius: 50%;
  box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.1);
  animation: bounce-x 1s infinite;
}

@keyframes bounce-x {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: rgba(30, 27, 75, 0.6);
}

/* 底部信息卡片 */
.pricing-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 64px;
  justify-content: center;
  margin-top: 80px;
}

.footer-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  max-width: 400px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.footer-card:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.1);
  transform: translateY(-4px);
}

.footer-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.footer-card h4 {
  font-size: 14px;
  font-weight: 900;
  color: #1e1b4b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.footer-card p {
  font-size: 12px;
  color: rgba(30, 27, 75, 0.6);
  line-height: 1.6;
  font-weight: 600;
}

@media (max-width: 768px) {
  .pricing-title-main {
    font-size: 64px;
  }

  .pricing-title-gradient {
    font-size: 64px;
  }

  .package-card {
    width: 320px;
  }

  .duration-selector {
    flex-wrap: wrap;
    gap: 4px;
  }

  .duration-btn {
    padding: 10px 20px;
    font-size: 9px;
  }
}
</style>
