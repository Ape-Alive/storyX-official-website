<template>
  <div class="pricing-page">
    <div class="pricing-container">
      <!-- 订阅时长选择器 -->
      <div class="duration-selector-wrapper">
        <div class="duration-selector" :class="{ 'is-disabled': loading }">
          <button
            v-for="duration in durations"
            :key="duration.value"
            type="button"
            :disabled="loading"
            :class="[
              'duration-btn',
              { active: selectedDuration === duration.value },
            ]"
            @click="handleDurationChange(duration.value)"
          >
            <span>{{ duration.label }}</span>
            <span v-if="duration.discount" class="discount-badge">{{
              duration.discount
            }}</span>
          </button>
        </div>
      </div>

      <!-- 加载骨架 -->
      <div v-if="loading" class="packages-scroll-wrapper" aria-busy="true" aria-live="polite">
        <div class="packages-scroll-container center-cards">
          <div v-for="n in 3" :key="n" class="package-card skeleton-card">
            <div class="package-inner">
              <div class="skeleton-line skeleton-title" />
              <div class="skeleton-line skeleton-price" />
              <div class="skeleton-line skeleton-desc" />
              <div class="skeleton-metrics">
                <div class="skeleton-block" />
                <div class="skeleton-block" />
              </div>
              <div class="skeleton-line" />
              <div class="skeleton-line" />
              <div class="skeleton-line skeleton-short" />
              <div class="skeleton-btn" />
            </div>
          </div>
        </div>
        <div class="loading-overlay">
          <el-icon class="is-loading" :size="28"><Loading /></el-icon>
          <span>正在加载套餐...</span>
        </div>
      </div>

      <!-- 套餐卡片（横向滚动） -->
      <div v-else class="packages-scroll-wrapper">
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
                  <span class="price-amount"
                    >¥{{ formatPrice(pkg.displayPrice) }}</span
                  >
                  <span class="price-unit">/{{ getDurationUnitLabel() }}</span>
                </div>
                <div v-if="pkg.hasDiscount" class="package-discount">
                  <span class="price-original">¥{{ formatPrice(pkg.originalPrice) }}</span>
                  <span class="discount-badge-inline">{{ pkg.discountLabel }}</span>
                  <span class="discount-saved">省¥{{ formatPrice(pkg.savedAmount) }}</span>
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
                  <span class="metric-value">{{
                    pkg.maxDevices ? `${pkg.maxDevices}台` : "不限制"
                  }}</span>
                </div>
              </div>

              <ul class="package-features">
                <li
                  v-for="feature in pkg.features"
                  :key="feature.label"
                  :class="['feature-item', { 'is-disabled': !feature.included }]"
                >
                  <div
                    :class="[
                      'feature-check',
                      {
                        'check-popular': index === 1 && feature.included,
                        'check-disabled': !feature.included,
                      },
                    ]"
                  >
                    <el-icon
                      v-if="feature.included"
                      :size="10"
                      :color="index === 1 ? '#fff' : '#4f46e5'"
                      ><Select
                    /></el-icon>
                    <span v-else class="feature-dash" aria-hidden="true" />
                  </div>
                  <span>{{ feature.label }}</span>
                </li>
              </ul>

              <button
                type="button"
                :class="['subscribe-btn', { 'btn-popular': index === 1 }]"
                :disabled="checkoutVisible && checkoutPkg?.id === pkg.id"
                @click="handleSubscribe(pkg)"
              >
                <span>{{ getButtonText() }}</span>
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
              <p class="custom-desc">需要算力算集群<br />或独立服务器部署？</p>
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

        <div v-if="!filteredPackages.length" class="empty-packages">
          当前周期暂无可用套餐
        </div>
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

    <PaymentCheckout
      v-model:visible="checkoutVisible"
      :pkg="checkoutPkg"
      :price-unit="`/${getDurationUnitLabel()}`"
      @success="onCheckoutSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { getToken } from "@/utils/storage";
import {
  Select,
  Lock,
  CreditCard,
  Plus,
  ArrowRight,
} from "@element-plus/icons-vue";
import { getAvailablePackages } from "@/api/pricing";
import PaymentCheckout from "@/components/PaymentCheckout.vue";
import {
  getPackageDiscountInfo,
  formatPackagePrice,
  formatDiscountLabel,
} from "@/utils/packagePrice";

const router = useRouter();
const route = useRoute();

const scrollContainerRef = ref(null);
const checkoutVisible = ref(false);
const checkoutPkg = ref(null);

const durations = [
  { value: "day", label: "按天" },
  { value: "month", label: "按月" },
  { value: "year", label: "按年" },
  { value: "permanent", label: "永久" },
];

const selectedDuration = ref("month");
const packages = ref([]);
const loading = ref(true);

// 根据时长筛选套餐
const filteredPackages = computed(() => {
  return packages.value
    .filter((pkg) => {
      // 兜底：仅展示标记为官网可见的套餐（后端也会过滤）
      if (pkg.showOnWebsite === false) return false
      if (selectedDuration.value === "permanent") {
        return !pkg.durationUnit;
      }
      return pkg.durationUnit === selectedDuration.value;
    })
    .map((pkg, index, list) => {
      const info = getPackageDiscountInfo(pkg);
      const anyRecommend = list.some((p) => p.isRecommend);
      return {
        ...pkg,
        isRecommended: anyRecommend ? Boolean(pkg.isRecommend) : index === 1,
        displayPrice: info.payable,
        originalPrice: info.original,
        hasDiscount: info.hasDiscount,
        discountLabel: formatDiscountLabel(info.discount),
        savedAmount: info.saved,
        features: getPackageFeatures(pkg),
      };
    });
});

const handleDurationChange = async (value) => {
  if (loading.value || selectedDuration.value === value) return;
  selectedDuration.value = value;
  await loadPackages();
};

// 格式化价格显示
const formatPrice = (price) => formatPackagePrice(price);

// 格式化额度
const formatQuota = (quota) => {
  if (!quota && quota !== 0) return "无限";
  const quotaNum = typeof quota === "string" ? parseFloat(quota) : quota;
  if (isNaN(quotaNum)) return "无限";
  if (quotaNum >= 1000) {
    return `${(quotaNum / 1000).toFixed(0)}K点`;
  }
  return `${quotaNum}点`;
};

// 获取时长单位标签
const getDurationUnitLabel = () => {
  const map = {
    day: "天",
    month: "月",
    year: "年",
    permanent: "永久",
  };
  return map[selectedDuration.value] || "月";
};

// 获取按钮文本
const getButtonText = () => {
  const map = {
    day: "立即订阅",
    month: "订阅按月版",
    year: "订阅按年版",
    permanent: "永久买断",
  };
  return map[selectedDuration.value] || "立即订阅";
};

// 套餐特性档位（无额度时仍展示对照项，并用划线表示不含）
const FEATURE_TIERS = {
  basic: ["2K 画质导出", "角色一致性引擎", "云端项目备份"],
  pro: ["4K 原生渲染", "多智能体协作流", "自定义配音模型", "专属水印定制"],
  team: ["团队共享额度", "项目权限分发", "ProRes 无损导出"],
};

// 获取套餐特性列表：优先使用套餐/角色权限文案
const getPackageFeatures = (pkg) => {
  const texts =
    (Array.isArray(pkg.effectivePermissionTexts) && pkg.effectivePermissionTexts) ||
    (Array.isArray(pkg.permissionTexts) && pkg.permissionTexts) ||
    (Array.isArray(pkg.clientRole?.permissionTexts) && pkg.clientRole.permissionTexts) ||
    []

  const labels = texts.map((item) => String(item || '').trim()).filter(Boolean)
  if (labels.length > 0) {
    return labels.map((label) => ({ label, included: true }))
  }

  // 兼容旧数据：无文案时按额度档位回退
  const quotaNum =
    pkg.quota === null || pkg.quota === undefined || pkg.quota === ""
      ? NaN
      : Number(pkg.quota);

  let fallback = FEATURE_TIERS.team;
  let included = true;

  if (!Number.isFinite(quotaNum) || quotaNum <= 0) {
    fallback = FEATURE_TIERS.team;
    included = false;
  } else if (quotaNum <= 1000) {
    fallback = FEATURE_TIERS.basic;
  } else if (quotaNum <= 5000) {
    fallback = FEATURE_TIERS.pro;
  }

  return fallback.map((label) => ({ label, included }));
};

// 加载套餐数据
const loadPackages = async () => {
  try {
    loading.value = true;
    const durationUnit =
      selectedDuration.value === "permanent"
        ? undefined
        : selectedDuration.value;
    const response = await getAvailablePackages("paid", durationUnit);
    if (response.success && response.data) {
      packages.value = Array.isArray(response.data) ? response.data : [];
    } else {
      packages.value = [];
    }
  } catch (error) {
    console.error("加载套餐失败:", error);
    packages.value = [];
    ElMessage.error("加载套餐信息失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 订阅处理
const handleSubscribe = async (pkg) => {
  if (!getToken()) {
    router.push({
      path: "/auth/login",
      query: { redirect: route.fullPath },
    });
    return;
  }

  checkoutPkg.value = pkg;
  checkoutVisible.value = true;
};

const onCheckoutSuccess = () => {};

onMounted(() => {
  loadPackages();
});
</script>

<style scoped>
/* 页面基础样式 */
.pricing-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 15% 0%, rgba(124, 108, 240, 0.08), transparent 48%),
    radial-gradient(ellipse at 85% 10%, rgba(91, 141, 239, 0.08), transparent 42%),
    #f3eee6;
  color: #1c1917;
  padding-top: 88px;
  position: relative;
  overflow-x: hidden;
}

.pricing-page::before,
.pricing-page::after {
  display: none;
}

.pricing-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 72px 32px 120px;
  position: relative;
  z-index: 10;
}

/* 时长选择器：分段控件，刻意与顶栏胶囊导航区分 */
.duration-selector-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 64px;
  width: 100%;
}

.duration-selector {
  display: flex;
  align-items: stretch;
  width: min(480px, 100%);
  padding: 4px;
  gap: 0;
  border-radius: 12px;
  background: #e7e1d7;
  border: 1px solid rgba(28, 25, 23, 0.08);
  box-shadow: none;
  backdrop-filter: none;
}

.duration-btn {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 11px 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: rgba(28, 25, 23, 0.55);
  font-family: "Space Grotesk", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.duration-btn:hover {
  color: #1c1917;
}

.duration-btn.active {
  background: #fffdf9;
  color: #1c1917;
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
}

.discount-badge {
  position: absolute;
  top: -11px;
  right: 4px;
  background: #c45c3a;
  color: #fffaf7;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.3;
  pointer-events: none;
}

/* 套餐滚动容器 */
.packages-scroll-wrapper {
  position: relative;
  margin-bottom: 80px;
  padding: 16px 4px 64px;
}

.packages-scroll-container {
  display: flex;
  align-items: stretch;
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

/* 套餐卡片：高度跟随最高卡片，按钮贴底对齐 */
.package-card {
  position: relative;
  flex-shrink: 0;
  width: 360px;
  min-height: 0;
  height: auto;
  padding: 0;
  border-radius: 28px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(28, 25, 23, 0.06);
  box-shadow: 0 16px 40px rgba(28, 25, 23, 0.06);
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 48px rgba(28, 25, 23, 0.1);
}

.package-card.recommended {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 48px rgba(28, 25, 23, 0.1);
  border: 1px solid rgba(28, 25, 23, 0.12);
}

.package-card.recommended:hover {
  box-shadow: 0 26px 56px rgba(28, 25, 23, 0.14);
}

.package-inner {
  position: relative;
  background: transparent;
  border-radius: 28px;
  padding: 36px;
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.package-card.recommended .package-inner {
  background: transparent;
  backdrop-filter: none;
}

.recommended-badge {
  position: absolute;
  top: 28px;
  right: 28px;
  background: #2f2a27;
  color: #faf7f2;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 9999px;
  text-transform: none;
  letter-spacing: 0.02em;
  box-shadow: none;
  animation: none;
}

@keyframes pulse-badge {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
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
  font-family: "Inter", sans-serif;
}

.package-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.package-discount {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.price-original {
  font-size: 13px;
  color: rgba(30, 27, 75, 0.4);
  text-decoration: line-through;
  font-family: "Space Grotesk", sans-serif;
}

.discount-badge-inline {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(236, 72, 153, 0.12);
  color: #db2777;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.discount-saved {
  font-size: 12px;
  font-weight: 600;
  color: #db2777;
}

.price-amount {
  font-size: 56px;
  font-weight: 900;
  color: #1e1b4b;
  letter-spacing: -0.05em;
  font-family: "Space Grotesk", sans-serif;
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
  font-family: "Space Grotesk", sans-serif;
}

/* 特性列表 */
.package-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  flex: 1 1 auto;
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

.feature-item.is-disabled {
  pointer-events: none;
}

.feature-item.is-disabled span {
  color: rgba(30, 27, 75, 0.35);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.feature-item.is-disabled:hover span {
  color: rgba(30, 27, 75, 0.35);
}

.check-disabled {
  background: rgba(30, 27, 75, 0.06);
}

.feature-dash {
  display: block;
  width: 8px;
  height: 1.5px;
  border-radius: 1px;
  background: rgba(30, 27, 75, 0.35);
}

/* 订阅按钮 */
.subscribe-btn {
  width: 100%;
  margin-top: auto;
  padding: 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-family: "Inter", sans-serif;
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.subscribe-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(99, 102, 241, 0.2);
}

.subscribe-btn:active {
  transform: scale(0.98);
}

.subscribe-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-popular {
  background: #2f2a27;
  color: #faf7f2;
  box-shadow: none;
}

.btn-popular:hover {
  background: #1c1917;
  box-shadow: none;
  transform: translateY(-2px);
}

/* 定制方案卡片 */
.custom-card {
  border: 1px dashed rgba(28, 25, 23, 0.18);
  background: rgba(255, 255, 255, 0.4);
  box-shadow: none;
}

.custom-card:hover {
  background: rgba(255, 255, 255, 0.55);
  border-color: rgba(28, 25, 23, 0.28);
  transform: translateY(-4px);
}

.custom-inner {
  background: transparent;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 40px;
  height: 100%;
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
  font-family: "Inter", sans-serif;
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
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

/* 加载骨架 */
.duration-selector.is-disabled {
  opacity: 0.65;
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(28, 25, 23, 0.55);
  font-size: 14px;
  font-weight: 600;
  background: rgba(243, 238, 230, 0.35);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.skeleton-card {
  pointer-events: none;
}

.skeleton-line,
.skeleton-block,
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
  width: 48%;
  height: 18px;
  margin-bottom: 18px;
}

.skeleton-price {
  width: 36%;
  height: 36px;
  margin-bottom: 14px;
}

.skeleton-desc {
  width: 78%;
  margin-bottom: 24px;
}

.skeleton-short {
  width: 55%;
}

.skeleton-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 8px 0 24px;
}

.skeleton-block {
  height: 64px;
  border-radius: 14px;
}

.skeleton-btn {
  height: 44px;
  margin-top: 28px;
  border-radius: 999px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.empty-packages {
  text-align: center;
  padding: 48px 16px;
  color: rgba(28, 25, 23, 0.45);
  font-size: 14px;
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
  font-family: "Inter", sans-serif;
}

.footer-card p {
  font-size: 12px;
  color: rgba(30, 27, 75, 0.6);
  line-height: 1.6;
  font-weight: 600;
}

@media (max-width: 960px) {
  .pricing-page {
    /* 顶部仅品牌行，导航已移至底部 Tab */
    padding-top: 80px;
    padding-bottom: 88px;
  }

  .pricing-container {
    padding: 40px 20px 80px;
  }

  .duration-selector-wrapper {
    margin-bottom: 36px;
  }

  .duration-selector {
    width: 100%;
    max-width: none;
  }

  .duration-btn {
    padding: 10px 4px;
    font-size: 13px;
  }

  .discount-badge {
    top: -10px;
    right: 2px;
    font-size: 8px;
    padding: 2px 5px;
  }

  .packages-scroll-wrapper {
    margin-bottom: 40px;
    padding: 0 0 24px;
  }

  .packages-scroll-container,
  .packages-scroll-container.center-cards,
  .packages-scroll-container:not(.center-cards) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    overflow: visible;
    padding: 0;
    justify-content: flex-start;
  }

  .package-card {
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 0;
    border-radius: 22px;
  }

  .package-card:hover,
  .custom-card:hover {
    transform: none;
  }

  .package-inner {
    padding: 24px 20px;
    border-radius: 22px;
  }

  .recommended-badge {
    top: 16px;
    right: 16px;
    font-size: 10px;
    padding: 5px 10px;
  }

  .package-header {
    margin-bottom: 20px;
    padding-right: 72px;
  }

  .package-name {
    font-size: 18px;
    margin-bottom: 8px;
  }

  .price-amount {
    font-size: 40px;
  }

  .price-unit {
    font-size: 14px;
  }

  .package-desc {
    font-size: 12px;
  }

  .package-metrics {
    gap: 8px;
    margin-bottom: 20px;
  }

  .metric-item {
    padding: 12px 10px;
    border-radius: 14px;
  }

  .metric-value {
    font-size: 14px;
  }

  .package-features {
    margin-bottom: 24px;
  }

  .feature-item {
    margin-bottom: 12px;
    gap: 10px;
  }

  .feature-item span {
    font-size: 12px;
  }

  .subscribe-btn {
    padding: 14px;
    border-radius: 14px;
    font-size: 13px;
    letter-spacing: 0.04em;
  }

  .custom-inner {
    padding: 32px 20px;
  }

  .custom-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .custom-title {
    font-size: 18px;
  }

  .scroll-hint {
    display: none;
  }

  .pricing-footer {
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
    align-items: stretch;
  }

  .footer-card {
    max-width: none;
    width: 100%;
    padding: 18px 16px;
    gap: 14px;
    border-radius: 16px;
  }

  .footer-card:hover {
    transform: none;
  }

  .footer-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .footer-card h4 {
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: none;
  }

  .footer-card p {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .pricing-page {
    padding-top: 72px;
    padding-bottom: 88px;
  }

  .pricing-container {
    padding: 28px 16px 64px;
  }

  .duration-btn {
    padding: 9px 2px;
    font-size: 12px;
    letter-spacing: 0.02em;
  }

  .discount-badge {
    right: 0;
  }

  .package-inner {
    padding: 20px 16px;
  }

  .package-header {
    padding-right: 64px;
  }

  .price-amount {
    font-size: 36px;
  }
}
</style>
