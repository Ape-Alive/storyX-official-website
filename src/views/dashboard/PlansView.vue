<template>
  <div class="plans-view" :class="{ 'is-mobile': isMobile }">
    <section v-if="isMobile" class="mobile-active-plans" v-loading="activePlansLoading">
      <div class="mobile-active-plans__header">
        <h2 class="mobile-active-plans__title">活跃会员</h2>
      </div>

      <van-empty
        v-if="!activePlansLoading && activePlans.length === 0"
        image="search"
        description="暂无活跃会员"
      >
        <van-button round type="primary" size="small" @click="scrollToBuy">
          立即开通会员
        </van-button>
      </van-empty>

      <div
        v-for="plan in activePlans"
        :key="plan.id"
        class="mobile-active-plan-card"
        :class="{ 'is-warning': plan.status === 'warning' }"
      >
        <div class="mobile-active-plan-card__top">
          <div>
            <div class="mobile-active-plan-card__name">{{ plan.name }}</div>
            <div class="mobile-active-plan-card__expiry">
              {{ plan.expiry ? `有效期至 ${plan.expiry}` : '永久有效' }}
            </div>
          </div>
          <van-tag v-if="plan.status === 'warning'" type="warning" round>额度将尽</van-tag>
          <van-tag v-else type="success" plain round>使用中</van-tag>
        </div>
        <van-progress
          v-if="!plan.unlimited"
          :percentage="planPercentage(plan)"
          :stroke-width="8"
          :color="plan.status === 'warning' ? '#a16207' : '#111111'"
          track-color="rgba(28,25,23,0.06)"
          pivot-text=""
        />
        <div class="mobile-active-plan-card__stats">
          <template v-if="plan.unlimited">
            <span class="unlimited-quota">无限积分</span>
          </template>
          <template v-else>
            <span>已用 {{ formatQuota(plan.used) }}</span>
            <span>剩余 {{ formatQuota(plan.remaining ?? Math.max((plan.limit || 0) - (plan.used || 0), 0)) }}</span>
          </template>
        </div>
      </div>
    </section>

    <div class="plans-pricing">
      <header class="pricing-hero">
        <h2 class="pricing-title">选择你最合适的计划</h2>
        <p class="pricing-subtitle">按版本挑选周卡到年卡，权益即时生效</p>
      </header>

      <div class="plan-toolbar" ref="buyAnchorRef">
        <button type="button" class="toolbar-pill is-active" aria-current="page">
          <span class="toolbar-pill__dot" aria-hidden="true" />
          <span>会员计划</span>
        </button>

        <div class="tier-switch" role="tablist" aria-label="会员版本">
          <button
            v-for="tier in tiers"
            :key="tier.roleKey"
            type="button"
            role="tab"
            :aria-selected="selectedTier === tier.roleKey"
            :disabled="loading"
            :class="['tier-btn', { active: selectedTier === tier.roleKey }]"
            @click="handleTierChange(tier.roleKey)"
          >
            {{ tier.label }}
          </button>
        </div>

        <button type="button" class="toolbar-pill is-action" @click="handleContact">
          <span>采购咨询</span>
          <span class="toolbar-pill__chevron" aria-hidden="true">›</span>
        </button>
      </div>

      <div
        v-if="loading"
        class="plan-matrix"
        aria-busy="true"
        aria-live="polite"
      >
        <div v-for="n in 4" :key="n" class="plan-col skeleton-col">
          <div class="skeleton-line skeleton-title" />
          <div class="skeleton-line skeleton-price" />
          <div class="skeleton-btn" />
          <div class="skeleton-line" />
          <div class="skeleton-line skeleton-short" />
        </div>
        <div class="loading-overlay">
          <el-icon class="is-loading" :size="28"><Loading /></el-icon>
          <span>正在加载会员计划...</span>
        </div>
      </div>

      <div v-else class="plan-matrix" role="list">
        <article
          v-for="slot in durationCards"
          :key="slot.key"
          role="listitem"
          :class="[
            'plan-col',
            {
              'is-recommended': slot.pkg?.isRecommended,
              'is-current': slot.pkg?.isCurrent,
              'is-empty': !slot.pkg,
            },
          ]"
        >
          <template v-if="slot.pkg">
            <div class="plan-col__head">
              <div class="plan-col__title-row">
                <h3 class="plan-col__name">{{ slot.pkg.cardTitle }}</h3>
                <span v-if="slot.pkg.isRecommended" class="plan-col__badge">推荐</span>
                <span v-else-if="slot.pkg.isCurrent" class="plan-col__badge is-current">当前会员</span>
              </div>
              <p class="plan-col__desc">{{ slot.pkg.cardDesc }}</p>

              <div class="plan-col__price">
                <span class="price-amount">¥{{ formatPrice(slot.pkg.displayPrice) }}</span>
                <span class="price-unit">/{{ slot.unitLabel }}</span>
              </div>
              <div v-if="slot.pkg.hasDiscount" class="plan-col__discount">
                <span class="price-original">¥{{ formatPrice(slot.pkg.originalPrice) }}</span>
                <span class="discount-chip">{{ slot.pkg.discountLabel }}</span>
              </div>

              <button
                type="button"
                :class="[
                  'buy-btn',
                  {
                    'is-primary': slot.pkg.isRecommended && !slot.pkg.buttonStatus?.disabled,
                    'is-current': slot.pkg.buttonStatus?.disabled,
                  },
                ]"
                :disabled="slot.pkg.buttonStatus?.disabled || (checkoutVisible && checkoutPkg?.id === slot.pkg.id)"
                @click="handleSelectPlan(slot.pkg)"
              >
                {{ slot.pkg.buttonStatus?.text || '立即购买' }}
              </button>
            </div>

            <div class="plan-col__row">
              <div class="plan-col__row-label">赠送积分</div>
              <div class="plan-col__row-value">
                <span class="gift-quota__value">{{ formatGiftQuota(slot.pkg.quota) }}</span>
                <span class="gift-quota__unit">积分</span>
                <span class="gift-quota__note">会员过期清空</span>
              </div>
            </div>

            <div class="plan-col__row">
              <div class="plan-col__row-label">可用于</div>
              <div class="plan-col__tags">
                <span
                  v-for="tag in QUOTA_USAGE_TAGS"
                  :key="tag"
                  class="plan-col__tag"
                >{{ tag }}</span>
              </div>
            </div>

            <ul v-if="slot.pkg.features.length" class="plan-col__features">
              <li
                v-for="feature in slot.pkg.features"
                :key="feature.label"
              >
                <span class="feature-mark" aria-hidden="true">
                  <el-icon :size="12"><Select /></el-icon>
                </span>
                <span>{{ feature.label }}</span>
              </li>
            </ul>
          </template>

          <template v-else>
            <div class="plan-col__head">
              <h3 class="plan-col__name">{{ slot.label }}</h3>
              <p class="plan-col__desc">该版本暂未上架此周期套餐</p>
              <button type="button" class="buy-btn" disabled>暂不可购</button>
            </div>
          </template>
        </article>
      </div>

      <div v-if="!loading && !hasAnyPackage" class="empty-packages">
        当前版本暂无可用会员计划
      </div>

      <section class="compare-section" aria-labelledby="compare-heading">
        <h2 id="compare-heading" class="compare-title">各版本功能比较</h2>

        <div v-if="compareLoading" class="compare-loading">
          <el-icon class="is-loading" :size="22"><Loading /></el-icon>
          <span>加载对比信息...</span>
        </div>

        <div v-else class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th scope="col">功能</th>
                <th
                  v-for="tier in tiers"
                  :key="tier.roleKey"
                  scope="col"
                  :class="{ 'is-current': selectedTier === tier.roleKey }"
                >
                  {{ tier.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareRows" :key="row.featureKey || row.name">
                <th scope="row">{{ row.name }}</th>
                <td
                  v-for="tier in tiers"
                  :key="tier.roleKey"
                  :class="{ 'is-current': selectedTier === tier.roleKey }"
                >
                  <template v-if="row.byTier[tier.roleKey]?.included">
                    <div
                      v-if="row.byTier[tier.roleKey].quotas?.length"
                      class="compare-quota"
                    >
                      <span
                        v-for="q in row.byTier[tier.roleKey].quotas"
                        :key="q.key"
                        class="compare-quota__item"
                      >{{ q.display }}</span>
                    </div>
                    <span v-else class="compare-yes" aria-label="支持">
                      <el-icon :size="14"><Select /></el-icon>
                    </span>
                  </template>
                  <span v-else class="compare-no" aria-label="不支持">—</span>
                </td>
              </tr>
              <tr v-if="!compareRows.length">
                <td colspan="4" class="compare-empty">暂无对比数据，请稍后再试</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <PaymentCheckout
      v-model:visible="checkoutVisible"
      :pkg="checkoutPkg"
      :order-type="checkoutOrderType"
      :price-unit="checkoutPriceUnit"
      @success="onCheckoutSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Select, Loading } from '@element-plus/icons-vue'
import { getAvailablePackages, getMyPackages, getFeatureCompare } from '@/api/pricing'
import PaymentCheckout from '@/components/PaymentCheckout.vue'
import { useDevice } from '@/utils/device'
import { useMyActivePackages } from '@/composables/useMyActivePackages'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'
import {
  getPackagePayableAmount,
  getPackageDiscountInfo,
  formatPackagePrice,
  formatDiscountLabel,
} from '@/utils/packagePrice'

const router = useRouter()
const { isMobile } = useDevice()
const { runPageBoot } = useDashboardPageBoot()
const {
  plans: activePlans,
  loading: activePlansLoading,
  formatQuota,
  planPercentage,
  loadMyPackages: loadActivePackages,
} = useMyActivePackages({ immediate: false })

const buyAnchorRef = ref(null)
const checkoutVisible = ref(false)
const checkoutPkg = ref(null)
const checkoutOrderType = ref('purchase')
const checkoutPriceUnit = ref('/月')

const tiers = [
  { label: '基础版', roleKey: 'custom_base_user' },
  { label: '高级版', roleKey: 'custom_pro_user' },
  { label: '至尊版', roleKey: 'custom_super_user' },
]

const DURATION_SLOTS = [
  {
    key: 'week',
    label: '周卡',
    unitLabel: '周',
  },
  {
    key: 'month',
    label: '月卡',
    unitLabel: '月',
  },
  {
    key: 'quarter',
    label: '季卡',
    unitLabel: '季',
  },
  {
    key: 'year',
    label: '年卡',
    unitLabel: '年',
  },
]

const selectedTier = ref('custom_base_user')
const packages = ref([])
const myPackages = ref([])
const compareRows = ref([])
const loading = ref(true)
const compareLoading = ref(true)

const QUOTA_USAGE_TAGS = [
  '封面生成',
  '绘火 Agent',
  '剧本分镜',
  '角色定妆',
  '场景视频',
  'AI 画布',
]

const scrollToBuy = () => {
  buyAnchorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const resolveDurationSlot = (pkg) => {
  const name = `${pkg.displayName || ''} ${pkg.name || ''}`
  if (/周卡|周会员|weekly/i.test(name)) return 'week'
  if (/季卡|季度|quarter/i.test(name)) return 'quarter'
  if (/年卡|年度|yearly|annual/i.test(name)) return 'year'
  if (/月卡|月度|monthly/i.test(name)) return 'month'

  const unit = pkg.durationUnit
  const duration = Number(pkg.duration) || 0
  if (!unit) return null
  if (unit === 'year') return 'year'
  if (unit === 'month') {
    if (duration >= 12) return 'year'
    if (duration >= 3) return 'quarter'
    return 'month'
  }
  if (unit === 'day') {
    if (duration >= 360) return 'year'
    if (duration >= 80) return 'quarter'
    if (duration >= 25) return 'month'
    if (duration >= 5) return 'week'
  }
  return null
}

const resolveCardTitle = (pkg) => {
  const slot = resolveDurationSlot(pkg)
  const found = DURATION_SLOTS.find((s) => s.key === slot)
  if (found) return found.label
  return pkg.displayName || pkg.name || '会员'
}

const buildValidityText = (pkg) => {
  const unit = pkg.durationUnit
  const duration = Number(pkg.duration) || 0
  if (!unit || !duration) return ''
  if (unit === 'day') return `有效期 ${duration} 天`
  if (unit === 'month') return `有效期 ${duration} 个月`
  if (unit === 'year') return `有效期 ${duration} 年`
  return ''
}

const buildCardDesc = (pkg) => {
  const title = resolveCardTitle(pkg)
  const raw = String(pkg.description || '').trim()
  const isUseless =
    !raw ||
    raw === title ||
    raw === pkg.displayName ||
    raw === pkg.name

  const devicePart = pkg.maxDevices
    ? `最多仅限 ${pkg.maxDevices} 台设备同时使用`
    : '设备数量不限制'
  const validity = buildValidityText(pkg)

  if (!isUseless) return raw
  if (validity) return `${validity}，${devicePart}`
  return devicePart
}

const extractFeatureLabels = (pkg) => {
  const texts =
    (Array.isArray(pkg.effectivePermissionTexts) && pkg.effectivePermissionTexts) ||
    (Array.isArray(pkg.permissionTexts) && pkg.permissionTexts) ||
    (Array.isArray(pkg.clientRole?.permissionTexts) && pkg.clientRole.permissionTexts) ||
    []
  return texts
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter(
      (label) =>
        !/套餐积分额度内调用|积分额度内调用|^积分额度|^无限积分|^套餐积分额度/.test(label),
    )
}

const getPackageFeatures = (pkg) =>
  extractFeatureLabels(pkg).map((label) => ({
    label,
    included: true,
  }))

const resolveButtonStatus = (pkg) => {
  const myPackage = myPackages.value.find((mp) => mp.packageId === pkg.id)
  if (!myPackage) {
    return { disabled: false, text: '立即购买', isCurrent: false, orderType: 'purchase' }
  }
  if (myPackage.status === 'active') {
    return { disabled: true, text: '当前已选择', isCurrent: true, orderType: 'purchase' }
  }
  if (myPackage.status === 'expired' || myPackage.status === 'no_quota') {
    return { disabled: false, text: '复购', isCurrent: false, orderType: 'renewal' }
  }
  return { disabled: false, text: '立即购买', isCurrent: false, orderType: 'purchase' }
}

const enrichPackage = (pkg) => {
  const info = getPackageDiscountInfo(pkg)
  const buttonStatus = resolveButtonStatus(pkg)
  return {
    ...pkg,
    displayPrice: info.payable,
    originalPrice: info.original,
    hasDiscount: info.hasDiscount,
    discountLabel: formatDiscountLabel(info.discount),
    savedAmount: info.saved,
    features: getPackageFeatures(pkg),
    cardTitle: resolveCardTitle(pkg),
    cardDesc: buildCardDesc(pkg),
    buttonStatus,
    isCurrent: buttonStatus.isCurrent,
  }
}

const pickBestForSlot = (list) => {
  if (!list.length) return null
  const recommended = list.find((p) => p.isRecommend)
  if (recommended) return recommended
  return [...list].sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
}

const durationCards = computed(() => {
  const enriched = packages.value
    .filter((pkg) => pkg.showOnWebsite !== false)
    .map((pkg) => enrichPackage(pkg))

  const grouped = {
    week: [],
    month: [],
    quarter: [],
    year: [],
  }

  for (const pkg of enriched) {
    const slot = resolveDurationSlot(pkg)
    if (slot && grouped[slot]) grouped[slot].push(pkg)
  }

  const picked = DURATION_SLOTS.map((slot) => ({
    ...slot,
    pkg: pickBestForSlot(grouped[slot.key]),
  }))

  const backendRecommended = picked.some((slot) => slot.pkg?.isRecommend)
  return picked.map((slot) => {
    if (!slot.pkg) return slot
    const isRecommended = backendRecommended
      ? Boolean(slot.pkg.isRecommend)
      : slot.key === 'quarter'
    return {
      ...slot,
      pkg: { ...slot.pkg, isRecommended },
    }
  })
})

const hasAnyPackage = computed(() =>
  durationCards.value.some((slot) => Boolean(slot.pkg)),
)

const formatPrice = (price) => formatPackagePrice(price)

const formatGiftQuota = (quota) => {
  if (quota === null || quota === undefined || quota === '') return '无限'
  const quotaNum = typeof quota === 'string' ? parseFloat(quota) : Number(quota)
  if (!Number.isFinite(quotaNum)) return '无限'
  if (Number.isInteger(quotaNum) || Math.abs(quotaNum - Math.round(quotaNum)) < 1e-9) {
    return String(Math.round(quotaNum))
  }
  return parseFloat(quotaNum.toFixed(2)).toString()
}

const loadMyPackagesList = async () => {
  try {
    const response = await getMyPackages({ activeOnly: false })
    if (response.success && response.data) {
      myPackages.value = response.data
    }
  } catch (error) {
    console.error('加载我的会员失败:', error)
  }
}

const loadPackages = async () => {
  try {
    loading.value = true
    if (myPackages.value.length === 0) {
      await loadMyPackagesList()
    }
    const response = await getAvailablePackages('paid', undefined, selectedTier.value)
    if (response.success && response.data) {
      packages.value = Array.isArray(response.data) ? response.data : []
    } else {
      packages.value = []
    }
  } catch (error) {
    console.error('加载会员计划失败:', error)
    packages.value = []
    ElMessage.error('加载会员计划失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadCompareData = async () => {
  try {
    compareLoading.value = true
    const response = await getFeatureCompare(tiers.map((t) => t.roleKey))
    if (response.success && response.data?.rows) {
      compareRows.value = Array.isArray(response.data.rows) ? response.data.rows : []
    } else {
      compareRows.value = []
    }
  } catch (error) {
    console.error('加载版本对比失败:', error)
    compareRows.value = []
  } finally {
    compareLoading.value = false
  }
}

const handleTierChange = async (roleKey) => {
  if (loading.value || selectedTier.value === roleKey) return
  selectedTier.value = roleKey
  await loadPackages()
}

const handleContact = () => {
  router.push('/dashboard/contact')
}

const handleSelectPlan = (pkg) => {
  if (pkg.buttonStatus?.disabled) return

  const payable = getPackagePayableAmount(pkg)
  const slot = resolveDurationSlot(pkg)
  const unit = DURATION_SLOTS.find((s) => s.key === slot)?.unitLabel || '期'
  checkoutPriceUnit.value = `/${unit}`
  checkoutPkg.value = {
    ...pkg,
    displayName: pkg.displayName || pkg.cardTitle || pkg.name,
    displayPrice: payable,
  }
  checkoutOrderType.value = pkg.buttonStatus?.orderType || 'purchase'
  checkoutVisible.value = true
}

const onCheckoutSuccess = async () => {
  await loadMyPackagesList()
  await loadPackages()
  if (isMobile.value) {
    await loadActivePackages()
  }
}

onMounted(() => {
  runPageBoot(() =>
    Promise.allSettled([
      isMobile.value ? loadActivePackages() : Promise.resolve(),
      loadMyPackagesList().then(() => loadPackages()),
      loadCompareData(),
    ]),
  )
})
</script>

<style scoped>
.plans-view {
  --pricing-ink: #1c1917;
  --pricing-muted: rgba(28, 25, 23, 0.58);
  --pricing-line: rgba(28, 25, 23, 0.1);
  --pricing-card: #fffdf9;
  --pricing-accent: #111111;
  --pricing-accent-soft: rgba(17, 17, 17, 0.12);
  --pricing-warm: #57534e;

  animation: fadeInSlide 0.5s ease-out;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: var(--pricing-ink);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-active-plans {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-active-plans__header {
  padding: 0 2px;
}

.mobile-active-plans__title {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  color: var(--pricing-ink);
}

.mobile-active-plan-card {
  padding: 14px;
  border-radius: 14px;
  background: var(--pricing-card);
  border: 1px solid var(--pricing-line);
}

.mobile-active-plan-card.is-warning {
  border-color: rgba(161, 98, 7, 0.35);
}

.mobile-active-plan-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.mobile-active-plan-card__name {
  font-size: 15px;
  font-weight: 700;
}

.mobile-active-plan-card__expiry {
  margin-top: 2px;
  font-size: 12px;
  color: var(--pricing-muted);
}

.mobile-active-plan-card__stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--pricing-muted);
  font-weight: 600;
}

.unlimited-quota {
  color: var(--pricing-accent);
}

.plans-pricing {
  width: 100%;
}

.pricing-hero {
  text-align: center;
  margin-bottom: 28px;
}

.pricing-title {
  margin: 0 0 8px;
  font-family: 'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.pricing-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--pricing-muted);
  font-weight: 500;
}

.plan-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.toolbar-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: rgba(28, 25, 23, 0.06);
  color: rgba(28, 25, 23, 0.72);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.toolbar-pill:hover {
  background: rgba(28, 25, 23, 0.09);
  color: var(--pricing-ink);
}

.toolbar-pill.is-active {
  background: #111;
  color: #faf7f2;
  box-shadow: none;
}

.toolbar-pill.is-action {
  padding-right: 12px;
}

.toolbar-pill.is-action:hover {
  border-color: rgba(17, 17, 17, 0.22);
  color: var(--pricing-accent);
  background: rgba(17, 17, 17, 0.08);
}

.toolbar-pill__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 253, 249, 0.28);
  box-shadow: inset 0 0 0 3px rgba(255, 253, 249, 0.55);
  flex-shrink: 0;
}

.toolbar-pill.is-active .toolbar-pill__dot {
  background: #fffdf9;
  box-shadow: inset 0 0 0 3px rgba(28, 25, 23, 0.35);
}

.toolbar-pill__chevron {
  font-size: 16px;
  line-height: 1;
  font-weight: 500;
  opacity: 0.75;
  transform: translateY(-0.5px);
}

.tier-switch {
  display: flex;
  justify-self: center;
  width: min(420px, 100%);
  padding: 4px;
  border-radius: 999px;
  background: rgba(28, 25, 23, 0.06);
  border: 1px solid transparent;
  gap: 4px;
}

.tier-btn {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--pricing-muted);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.tier-btn:hover:not(:disabled) {
  color: var(--pricing-ink);
}

.tier-btn.active {
  background: #fffdf9;
  color: var(--pricing-ink);
  box-shadow: none;
  border: 1px solid var(--pricing-line);
}

.tier-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.plan-matrix {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  align-items: stretch;
  min-height: 460px;
  margin-bottom: 48px;
  border-top: 1px solid var(--pricing-line);
}

.plan-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 460px;
  padding: 24px 16px 8px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--pricing-line);
  box-shadow: none;
  border-radius: 0;
}

.plan-col:last-child {
  border-right: none;
}

.plan-col.is-recommended,
.plan-col.is-current {
  background: rgba(28, 25, 23, 0.03);
}

.plan-col.is-empty {
  opacity: 0.72;
}

.plan-col__head {
  padding-bottom: 16px;
}

.plan-col__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.plan-col__name {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
}

.plan-col__badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.plan-col__badge.is-current {
  background: #525252;
}

.plan-col__desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--pricing-muted);
  min-height: 40px;
}

.plan-col__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.price-amount {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  font-family: 'Space Grotesk', sans-serif;
}

.price-unit {
  font-size: 14px;
  font-weight: 600;
  color: var(--pricing-muted);
}

.plan-col__discount {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.price-original {
  font-size: 13px;
  color: rgba(28, 25, 23, 0.4);
  text-decoration: line-through;
}

.discount-chip {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(87, 83, 78, 0.12);
  color: var(--pricing-warm);
  font-size: 11px;
  font-weight: 700;
}

.buy-btn {
  width: 100%;
  margin-top: 4px;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.buy-btn:hover:not(:disabled) {
  background: #000;
}

.buy-btn.is-primary {
  background: #111;
}

.buy-btn.is-primary:hover:not(:disabled) {
  background: #000;
}

.buy-btn.is-current,
.buy-btn:disabled {
  background: rgba(28, 25, 23, 0.08);
  color: rgba(28, 25, 23, 0.45);
  cursor: not-allowed;
}

.plan-col__row {
  padding: 14px 0;
  border-top: 1px solid var(--pricing-line);
}

.plan-col__row-label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--pricing-muted);
}

.plan-col__row-value {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 8px;
}

.gift-quota__value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  font-family: 'Space Grotesk', sans-serif;
}

.gift-quota__unit {
  font-size: 13px;
  font-weight: 650;
  color: var(--pricing-muted);
}

.gift-quota__note {
  font-size: 12px;
  color: var(--pricing-muted);
}

.gift-quota__note::before {
  content: '(';
}

.gift-quota__note::after {
  content: ')';
}

.plan-col__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-col__tag {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--pricing-line);
  background: transparent;
  font-size: 11px;
  font-weight: 650;
  color: rgba(28, 25, 23, 0.78);
}

.plan-col__features {
  list-style: none;
  margin: 0;
  padding: 8px 0 12px;
  border-top: 1px solid var(--pricing-line);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.plan-col__features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(28, 25, 23, 0.06);
  font-size: 13px;
  font-weight: 600;
  color: rgba(28, 25, 23, 0.78);
  line-height: 1.45;
}

.plan-col__features li:last-child {
  border-bottom: none;
}

.feature-mark {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 17, 17, 0.08);
  color: #111;
}

.empty-packages {
  text-align: center;
  margin: -24px 0 36px;
  color: var(--pricing-muted);
  font-size: 14px;
  font-weight: 600;
}

.compare-section {
  margin-top: 4px;
  padding: 8px 0 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.compare-title {
  margin: 0 0 18px;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
}

.compare-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 12px;
  color: var(--pricing-muted);
  font-size: 14px;
  font-weight: 600;
}

.compare-table-wrap {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}

.compare-table th,
.compare-table td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid var(--pricing-line);
  font-size: 13px;
}

.compare-table thead th {
  font-weight: 750;
}

.compare-table tbody th {
  text-align: left;
  font-weight: 650;
  color: rgba(28, 25, 23, 0.82);
}

.compare-table .is-current {
  background: rgba(17, 17, 17, 0.05);
}

.compare-yes {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--pricing-accent-soft);
  color: var(--pricing-accent);
}

.compare-quota {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.compare-quota__item {
  font-size: 12px;
  font-weight: 650;
  color: rgba(28, 25, 23, 0.82);
  line-height: 1.35;
}

.compare-no {
  color: rgba(28, 25, 23, 0.28);
  font-weight: 600;
}

.compare-empty {
  text-align: center;
  color: var(--pricing-muted);
  padding: 28px 12px !important;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--pricing-muted);
  font-size: 14px;
  font-weight: 600;
  background: rgba(255, 253, 249, 0.55);
  pointer-events: none;
  border-radius: 16px;
}

.skeleton-card {
  pointer-events: none;
}

.skeleton-line,
.skeleton-btn {
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    rgba(28, 25, 23, 0.06) 25%,
    rgba(28, 25, 23, 0.12) 37%,
    rgba(28, 25, 23, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease infinite;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 12px;
}

.skeleton-title {
  width: 42%;
  height: 22px;
  margin-bottom: 16px;
}

.skeleton-desc {
  width: 88%;
  margin-bottom: 24px;
}

.skeleton-price {
  width: 48%;
  height: 34px;
  margin-bottom: 18px;
}

.skeleton-short {
  width: 58%;
}

.skeleton-btn {
  height: 44px;
  margin-top: 18px;
  border-radius: 12px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.skeleton-col {
  pointer-events: none;
}

@media (max-width: 1200px) {
  .plan-matrix {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: 400px;
  }

  .plan-col {
    min-height: 400px;
  }

  .plan-col:nth-child(2n) {
    border-right: none;
  }

  .plan-col:nth-child(n + 3) {
    border-top: 1px solid var(--pricing-line);
  }
}

@media (max-width: 960px) {
  .plans-view {
    gap: 20px;
    padding-top: 0;
  }

  .plan-toolbar {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .toolbar-pill {
    width: 100%;
    min-height: 40px;
  }

  .tier-switch {
    width: 100%;
    justify-self: stretch;
  }

  .plan-matrix {
    margin-bottom: 32px;
  }

  .compare-section {
    padding: 0;
  }
}

@media (max-width: 640px) {
  .pricing-hero {
    margin-bottom: 20px;
  }

  .pricing-title {
    font-size: 22px;
  }

  .plan-matrix {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .plan-col {
    min-height: 340px;
    border-right: none;
    border-top: 1px solid var(--pricing-line);
    padding-left: 0;
    padding-right: 0;
  }

  .plan-col:first-child {
    border-top: none;
  }

  .price-amount {
    font-size: 30px;
  }

  .plan-col__name {
    font-size: 18px;
  }
}
</style>
