<template>
  <div class="pricing-page">
    <div class="pricing-container">
      <header class="pricing-hero">
        <h1 class="pricing-title">选择你最合适的计划</h1>
        <p class="pricing-subtitle">按版本挑选周卡到年卡，权益即时生效</p>
      </header>

      <!-- 图一结构：会员计划 | 版本切换 | 采购咨询 -->
      <div class="plan-toolbar">
        <button type="button" class="toolbar-side is-active" aria-current="page">
          会员计划
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

        <button type="button" class="toolbar-side" @click="handleProcurement">
          采购咨询
        </button>
      </div>

      <!-- 加载骨架 -->
      <div
        v-if="loading"
        class="duration-grid"
        aria-busy="true"
        aria-live="polite"
      >
        <div v-for="n in 4" :key="n" class="duration-card skeleton-card">
          <div class="skeleton-line skeleton-title" />
          <div class="skeleton-line skeleton-desc" />
          <div class="skeleton-line skeleton-price" />
          <div class="skeleton-line" />
          <div class="skeleton-line skeleton-short" />
          <div class="skeleton-btn" />
        </div>
        <div class="loading-overlay">
          <el-icon class="is-loading" :size="28"><Loading /></el-icon>
          <span>正在加载套餐...</span>
        </div>
      </div>

      <!-- 周 / 月 / 季 / 年 四列 -->
      <div v-else class="duration-grid">
        <article
          v-for="slot in durationCards"
          :key="slot.key"
          :class="[
            'duration-card',
            {
              'is-recommended': slot.pkg?.isRecommended,
              'is-empty': !slot.pkg,
            },
          ]"
        >
          <template v-if="slot.pkg">
            <div v-if="slot.pkg.isRecommended" class="recommend-tag">推荐</div>

            <div class="card-top">
              <h3 class="card-name">{{ slot.pkg.cardTitle }}</h3>
              <p class="card-desc">{{ slot.pkg.description || slot.fallbackDesc }}</p>
            </div>

            <div class="card-price-block">
              <div class="card-price">
                <span class="price-amount">¥{{ formatPrice(slot.pkg.displayPrice) }}</span>
                <span class="price-unit">/{{ slot.unitLabel }}</span>
              </div>
              <div v-if="slot.pkg.hasDiscount" class="card-discount">
                <span class="price-original">¥{{ formatPrice(slot.pkg.originalPrice) }}</span>
                <span class="discount-chip">{{ slot.pkg.discountLabel }}</span>
              </div>
              <div class="card-meta">
                <span>积分 {{ formatQuota(slot.pkg.quota) }}</span>
                <span>{{ deviceLimitText(slot.pkg) }}</span>
              </div>
            </div>

            <button
              type="button"
              :class="['buy-btn', { 'is-primary': slot.pkg.isRecommended }]"
              :disabled="checkoutVisible && checkoutPkg?.id === slot.pkg.id"
              @click="handleSubscribe(slot.pkg)"
            >
              立即购买
            </button>

            <ul class="card-features">
              <li
                v-for="feature in slot.pkg.features"
                :key="feature.label"
                :class="{ 'is-off': !feature.included }"
              >
                <span class="feature-mark" aria-hidden="true">
                  <el-icon v-if="feature.included" :size="12"><Select /></el-icon>
                  <span v-else class="feature-dash" />
                </span>
                <span>{{ feature.label }}</span>
              </li>
            </ul>
          </template>

          <template v-else>
            <h3 class="card-name">{{ slot.label }}</h3>
            <p class="card-desc empty-hint">该版本暂未上架此周期套餐</p>
            <button type="button" class="buy-btn" disabled>暂不可购</button>
          </template>
        </article>
      </div>

      <div v-if="!loading && !hasAnyPackage" class="empty-packages">
        当前版本暂无可用套餐
      </div>

      <!-- 各版本功能比较 -->
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
              <tr v-for="row in compareRows" :key="row.label">
                <th scope="row">{{ row.label }}</th>
                <td
                  v-for="tier in tiers"
                  :key="tier.roleKey"
                  :class="{ 'is-current': selectedTier === tier.roleKey }"
                >
                  <span
                    v-if="row.byTier[tier.roleKey]"
                    class="compare-yes"
                    aria-label="支持"
                  >
                    <el-icon :size="14"><Select /></el-icon>
                  </span>
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
      :price-unit="checkoutPriceUnit"
      @success="onCheckoutSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Select, Loading } from "@element-plus/icons-vue";
import { getToken } from "@/utils/storage";
import { getAvailablePackages } from "@/api/pricing";
import PaymentCheckout from "@/components/PaymentCheckout.vue";
import {
  getPackageDiscountInfo,
  formatPackagePrice,
  formatDiscountLabel,
} from "@/utils/packagePrice";

const router = useRouter();
const route = useRoute();

const tiers = [
  { label: "基础版", roleKey: "custom_base_user" },
  { label: "高级版", roleKey: "custom_pro_user" },
  { label: "至尊版", roleKey: "custom_super_user" },
];

const DURATION_SLOTS = [
  {
    key: "week",
    label: "周卡",
    unitLabel: "周",
    fallbackDesc: "按周灵活体验，适合轻度试用",
  },
  {
    key: "month",
    label: "月卡",
    unitLabel: "月",
    fallbackDesc: "按月续订，适合持续创作",
  },
  {
    key: "quarter",
    label: "季卡",
    unitLabel: "季",
    fallbackDesc: "三个月周期，性价比更优",
  },
  {
    key: "year",
    label: "年卡",
    unitLabel: "年",
    fallbackDesc: "全年权益，适合重度生产",
  },
];

const selectedTier = ref("custom_base_user");
const packages = ref([]);
const compareByTier = ref({});
const loading = ref(true);
const compareLoading = ref(true);
const checkoutVisible = ref(false);
const checkoutPkg = ref(null);
const checkoutPriceUnit = ref("/月");

const enrichPackage = (pkg) => {
  const info = getPackageDiscountInfo(pkg);
  return {
    ...pkg,
    displayPrice: info.payable,
    originalPrice: info.original,
    hasDiscount: info.hasDiscount,
    discountLabel: formatDiscountLabel(info.discount),
    savedAmount: info.saved,
    features: getPackageFeatures(pkg),
    cardTitle: resolveCardTitle(pkg),
  };
};

/** 将套餐归入周 / 月 / 季 / 年 */
const resolveDurationSlot = (pkg) => {
  const name = `${pkg.displayName || ""} ${pkg.name || ""}`;
  if (/周卡|周会员|weekly/i.test(name)) return "week";
  if (/季卡|季度|quarter/i.test(name)) return "quarter";
  if (/年卡|年度|yearly|annual/i.test(name)) return "year";
  if (/月卡|月度|monthly/i.test(name)) return "month";

  const unit = pkg.durationUnit;
  const duration = Number(pkg.duration) || 0;

  if (!unit) return null;

  if (unit === "year") return "year";

  if (unit === "month") {
    if (duration >= 12) return "year";
    if (duration >= 3) return "quarter";
    return "month";
  }

  if (unit === "day") {
    if (duration >= 360) return "year";
    if (duration >= 80) return "quarter";
    if (duration >= 25) return "month";
    if (duration >= 5) return "week";
  }

  return null;
};

const resolveCardTitle = (pkg) => {
  const slot = resolveDurationSlot(pkg);
  const found = DURATION_SLOTS.find((s) => s.key === slot);
  if (found) return found.label;
  return pkg.displayName || pkg.name || "套餐";
};

const pickBestForSlot = (list) => {
  if (!list.length) return null;
  const recommended = list.find((p) => p.isRecommend);
  if (recommended) return recommended;
  return [...list].sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
};

const durationCards = computed(() => {
  const enriched = packages.value
    .filter((pkg) => pkg.showOnWebsite !== false)
    .map((pkg) => enrichPackage(pkg));

  const grouped = {
    week: [],
    month: [],
    quarter: [],
    year: [],
  };

  for (const pkg of enriched) {
    const slot = resolveDurationSlot(pkg);
    if (slot && grouped[slot]) grouped[slot].push(pkg);
  }

  const picked = DURATION_SLOTS.map((slot) => ({
    ...slot,
    pkg: pickBestForSlot(grouped[slot.key]),
  }));

  const backendRecommended = picked.some((slot) => slot.pkg?.isRecommend);
  return picked.map((slot) => {
    if (!slot.pkg) return slot;
    const isRecommended = backendRecommended
      ? Boolean(slot.pkg.isRecommend)
      : slot.key === "quarter";
    return {
      ...slot,
      pkg: { ...slot.pkg, isRecommended },
    };
  });
});

const hasAnyPackage = computed(() =>
  durationCards.value.some((slot) => Boolean(slot.pkg)),
);

const extractFeatureLabels = (pkg) => {
  const texts =
    (Array.isArray(pkg.effectivePermissionTexts) &&
      pkg.effectivePermissionTexts) ||
    (Array.isArray(pkg.permissionTexts) && pkg.permissionTexts) ||
    (Array.isArray(pkg.clientRole?.permissionTexts) &&
      pkg.clientRole.permissionTexts) ||
    [];
  return texts.map((item) => String(item || "").trim()).filter(Boolean);
};

const getPackageFeatures = (pkg) => {
  const labels = extractFeatureLabels(pkg);
  if (labels.length > 0) {
    return labels.map((label) => ({ label, included: true }));
  }

  const fallback = [];
  if (pkg.maxDevices) {
    fallback.push(`多端登录 ${pkg.maxDevices} 台`);
  } else {
    fallback.push("多端登录不限制");
  }
  fallback.push(pkg.quota == null || pkg.quota === "" ? "无限积分额度" : "套餐积分额度");
  if (pkg.description) fallback.push(pkg.description);
  return fallback.map((label) => ({ label, included: true }));
};

const compareRows = computed(() => {
  const labelSet = new Set();
  const byTierLabels = {};

  for (const tier of tiers) {
    const pkgs = compareByTier.value[tier.roleKey] || [];
    const labels = new Set();
    for (const pkg of pkgs) {
      for (const label of extractFeatureLabels(pkg)) {
        labels.add(label);
        labelSet.add(label);
      }
    }
    // 无权限文案时用额度/设备兜底，保证表格有内容
    if (labels.size === 0 && pkgs.length > 0) {
      const sample = pkgs[0];
      const quotaLabel =
        sample.quota == null || sample.quota === ""
          ? "无限积分额度"
          : `积分额度 ${formatQuota(sample.quota)}`;
      labels.add(quotaLabel);
      labelSet.add(quotaLabel);
      const deviceLabel = sample.maxDevices
        ? `多端登录 ${sample.maxDevices} 台`
        : "多端登录不限制";
      labels.add(deviceLabel);
      labelSet.add(deviceLabel);
    }
    byTierLabels[tier.roleKey] = labels;
  }

  return [...labelSet].map((label) => ({
    label,
    byTier: Object.fromEntries(
      tiers.map((tier) => [tier.roleKey, byTierLabels[tier.roleKey]?.has(label) || false]),
    ),
  }));
});

const formatPrice = (price) => formatPackagePrice(price);

const formatQuota = (quota) => {
  if (quota === null || quota === undefined || quota === "") return "无限";
  const quotaNum = typeof quota === "string" ? parseFloat(quota) : Number(quota);
  if (!Number.isFinite(quotaNum)) return "无限";
  if (quotaNum >= 1000) return `${(quotaNum / 1000).toFixed(0)}K`;
  return String(quotaNum);
};

const deviceLimitText = (pkg) => {
  if (!pkg?.maxDevices) return "设备不限";
  return `限 ${pkg.maxDevices} 台设备`;
};

const handleTierChange = async (roleKey) => {
  if (loading.value || selectedTier.value === roleKey) return;
  selectedTier.value = roleKey;
  await loadPackages();
};

const loadPackages = async () => {
  try {
    loading.value = true;
    const response = await getAvailablePackages(
      "paid",
      undefined,
      selectedTier.value,
    );
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

const loadCompareData = async () => {
  try {
    compareLoading.value = true;
    const results = await Promise.all(
      tiers.map((tier) => getAvailablePackages("paid", undefined, tier.roleKey)),
    );
    const next = {};
    tiers.forEach((tier, index) => {
      const res = results[index];
      next[tier.roleKey] =
        res?.success && Array.isArray(res.data) ? res.data : [];
    });
    compareByTier.value = next;
  } catch (error) {
    console.error("加载版本对比失败:", error);
    compareByTier.value = {};
  } finally {
    compareLoading.value = false;
  }
};

const handleSubscribe = (pkg) => {
  if (!getToken()) {
    router.push({
      path: "/auth/login",
      query: { redirect: route.fullPath },
    });
    return;
  }

  const slot = resolveDurationSlot(pkg);
  const unit = DURATION_SLOTS.find((s) => s.key === slot)?.unitLabel || "期";
  checkoutPriceUnit.value = `/${unit}`;
  checkoutPkg.value = pkg;
  checkoutVisible.value = true;
};

const handleProcurement = () => {
  if (!getToken()) {
    router.push({
      path: "/auth/login",
      query: { redirect: "/dashboard/contact" },
    });
    return;
  }
  router.push("/dashboard/contact");
};

const onCheckoutSuccess = () => {};

onMounted(() => {
  loadPackages();
  loadCompareData();
});
</script>

<style scoped>
.pricing-page {
  --pricing-ink: #1c1917;
  --pricing-muted: rgba(28, 25, 23, 0.58);
  --pricing-line: rgba(28, 25, 23, 0.1);
  --pricing-card: rgba(255, 253, 249, 0.88);
  --pricing-accent: #2a5cff;
  --pricing-accent-soft: rgba(42, 92, 255, 0.12);
  --pricing-warm: #c45c3a;

  min-height: 100vh;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(42, 92, 255, 0.07), transparent 46%),
    radial-gradient(ellipse at 88% 8%, rgba(196, 92, 58, 0.08), transparent 40%),
    linear-gradient(180deg, #f6f1ea 0%, #efe8de 48%, #f7f3ec 100%);
  color: var(--pricing-ink);
  padding-top: 88px;
  position: relative;
  overflow-x: hidden;
}

.pricing-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 56px 28px 112px;
  position: relative;
  z-index: 10;
}

.pricing-hero {
  text-align: center;
  margin-bottom: 36px;
}

.pricing-title {
  margin: 0 0 10px;
  font-family: "Space Grotesk", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.pricing-subtitle {
  margin: 0;
  font-size: 15px;
  color: var(--pricing-muted);
  font-weight: 500;
}

.plan-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.toolbar-side {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid var(--pricing-line);
  background: rgba(255, 253, 249, 0.7);
  color: var(--pricing-muted);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
}

.toolbar-side:hover {
  color: var(--pricing-ink);
  border-color: rgba(28, 25, 23, 0.2);
}

.toolbar-side.is-active {
  background: var(--pricing-ink);
  border-color: var(--pricing-ink);
  color: #faf7f2;
}

.tier-switch {
  display: flex;
  justify-self: center;
  width: min(420px, 100%);
  padding: 4px;
  border-radius: 14px;
  background: rgba(28, 25, 23, 0.06);
  border: 1px solid var(--pricing-line);
  gap: 4px;
}

.tier-btn {
  flex: 1;
  min-width: 0;
  padding: 11px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--pricing-muted);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.tier-btn:hover:not(:disabled) {
  color: var(--pricing-ink);
}

.tier-btn.active {
  background: #fffdf9;
  color: var(--pricing-ink);
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
}

.tier-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.duration-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
  margin-bottom: 64px;
}

.duration-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 420px;
  padding: 28px 22px 24px;
  border-radius: 18px;
  background: var(--pricing-card);
  border: 1px solid var(--pricing-line);
  box-shadow: 0 14px 36px rgba(28, 25, 23, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.duration-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 40px rgba(28, 25, 23, 0.08);
}

.duration-card.is-recommended {
  border-color: rgba(42, 92, 255, 0.45);
  box-shadow:
    0 0 0 1px rgba(42, 92, 255, 0.18),
    0 18px 40px rgba(42, 92, 255, 0.1);
}

.duration-card.is-empty {
  justify-content: flex-start;
  opacity: 0.78;
}

.recommend-tag {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--pricing-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.card-top {
  margin-bottom: 18px;
}

.card-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-family: "Space Grotesk", "PingFang SC", sans-serif;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--pricing-muted);
  min-height: 40px;
}

.empty-hint {
  margin-bottom: 24px;
}

.card-price-block {
  margin-bottom: 20px;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-amount {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  font-family: "Space Grotesk", sans-serif;
}

.price-unit {
  font-size: 14px;
  font-weight: 600;
  color: var(--pricing-muted);
}

.card-discount {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
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
  background: rgba(196, 92, 58, 0.12);
  color: var(--pricing-warm);
  font-size: 11px;
  font-weight: 700;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--pricing-muted);
}

.buy-btn {
  width: 100%;
  margin-bottom: 20px;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(28, 25, 23, 0.08);
  color: var(--pricing-ink);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.buy-btn:hover:not(:disabled) {
  background: rgba(28, 25, 23, 0.14);
  transform: translateY(-1px);
}

.buy-btn.is-primary {
  background: var(--pricing-accent);
  color: #fff;
}

.buy-btn.is-primary:hover:not(:disabled) {
  background: #1f4de6;
}

.buy-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.card-features {
  list-style: none;
  margin: 0;
  padding: 16px 0 0;
  border-top: 1px solid var(--pricing-line);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.card-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(28, 25, 23, 0.78);
  line-height: 1.45;
}

.card-features li.is-off {
  color: rgba(28, 25, 23, 0.35);
  text-decoration: line-through;
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
  background: var(--pricing-accent-soft);
  color: var(--pricing-accent);
}

.feature-dash {
  display: block;
  width: 8px;
  height: 1.5px;
  border-radius: 1px;
  background: rgba(28, 25, 23, 0.35);
}

.empty-packages {
  text-align: center;
  margin: -36px 0 48px;
  color: var(--pricing-muted);
  font-size: 14px;
  font-weight: 600;
}

.compare-section {
  margin-top: 8px;
  padding: 28px 24px 20px;
  border-radius: 18px;
  background: rgba(255, 253, 249, 0.72);
  border: 1px solid var(--pricing-line);
}

.compare-title {
  margin: 0 0 20px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-family: "Space Grotesk", "PingFang SC", sans-serif;
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
  padding: 14px 12px;
  text-align: center;
  border-bottom: 1px solid var(--pricing-line);
  font-size: 14px;
}

.compare-table thead th {
  font-weight: 750;
  color: var(--pricing-ink);
}

.compare-table tbody th {
  text-align: left;
  font-weight: 650;
  color: rgba(28, 25, 23, 0.82);
}

.compare-table .is-current {
  background: rgba(42, 92, 255, 0.05);
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
  background: rgba(246, 241, 234, 0.42);
  backdrop-filter: blur(2px);
  pointer-events: none;
  border-radius: 18px;
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

@media (max-width: 1100px) {
  .duration-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .pricing-page {
    padding-top: 80px;
    padding-bottom: 88px;
  }

  .pricing-container {
    padding: 36px 18px 72px;
  }

  .plan-toolbar {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .toolbar-side {
    width: 100%;
  }

  .tier-switch {
    width: 100%;
    justify-self: stretch;
  }

  .duration-grid {
    margin-bottom: 40px;
  }

  .duration-card:hover {
    transform: none;
  }

  .compare-section {
    padding: 22px 14px 12px;
  }
}

@media (max-width: 640px) {
  .duration-grid {
    grid-template-columns: 1fr;
  }

  .price-amount {
    font-size: 34px;
  }

  .card-name {
    font-size: 22px;
  }
}
</style>
