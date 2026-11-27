<template>
  <div class="pricing-page">
    <div class="pricing-container">
      <header class="pricing-hero">
        <h1 class="pricing-title">选择你最合适的计划</h1>
        <p class="pricing-subtitle">按版本挑选周卡到年卡，权益即时生效</p>
      </header>

      <!-- 图一结构：会员计划 | 版本切换 | 采购咨询；侧栏胶囊样式参考图二 -->
      <div class="plan-toolbar">
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

        <button type="button" class="toolbar-pill is-action" @click="handleProcurement">
          <span>采购咨询</span>
          <span class="toolbar-pill__chevron" aria-hidden="true">›</span>
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
              <p class="card-desc">{{ slot.pkg.cardDesc }}</p>
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
            </div>

            <button
              type="button"
              :class="['buy-btn', { 'is-primary': slot.pkg.isRecommended }]"
              :disabled="checkoutVisible && checkoutPkg?.id === slot.pkg.id"
              @click="handleSubscribe(slot.pkg)"
            >
              {{ buyButtonText }}
            </button>

            <!-- 赠送积分（参考图二结构，积分取套餐额度） -->
            <div class="gift-quota">
              <div class="gift-quota__head">
                <span class="gift-quota__title">赠送积分</span>
                <span class="gift-quota__note">会员过期清空</span>
              </div>
              <div class="gift-quota__amount">
                <span class="gift-quota__value">{{ formatGiftQuota(slot.pkg.quota) }}</span>
                <span class="gift-quota__unit">积分</span>
              </div>
              <div class="gift-quota__usage">
                <div class="gift-quota__usage-label">可用于</div>
                <div class="gift-quota__tags">
                  <span
                    v-for="tag in QUOTA_USAGE_TAGS"
                    :key="tag"
                    class="gift-quota__tag"
                  >{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- 权限文案：仅取后台 permissionTexts / effectivePermissionTexts -->
            <ul v-if="slot.pkg.features.length" class="card-features">
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
import { useUserStore } from "@/stores";
import { getAvailablePackages, getFeatureCompare } from "@/api/pricing";
import PaymentCheckout from "@/components/PaymentCheckout.vue";
import {
  getPackageDiscountInfo,
  formatPackagePrice,
  formatDiscountLabel,
} from "@/utils/packagePrice";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const isLoggedIn = computed(() => !!userStore.token || !!getToken());
const buyButtonText = computed(() =>
  isLoggedIn.value ? "立即购买" : "登录并购买",
);

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
const compareRows = ref([]);
const loading = ref(true);
const compareLoading = ref(true);
const checkoutVisible = ref(false);
const checkoutPkg = ref(null);
const checkoutPriceUnit = ref("/月");

/** 客户端结论：套餐积分可用于的主要 AI 创作能力（展示标签） */
const QUOTA_USAGE_TAGS = [
  "封面生成",
  "绘火 Agent",
  "剧本分镜",
  "角色定妆",
  "场景视频",
  "AI 画布",
];

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
    cardDesc: buildCardDesc(pkg),
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

const buildValidityText = (pkg) => {
  const unit = pkg.durationUnit;
  const duration = Number(pkg.duration) || 0;
  if (!unit || !duration) return "";
  if (unit === "day") return `有效期 ${duration} 天`;
  if (unit === "month") return `有效期 ${duration} 个月`;
  if (unit === "year") return `有效期 ${duration} 年`;
  return "";
};

const buildCardDesc = (pkg) => {
  const title = resolveCardTitle(pkg);
  const raw = String(pkg.description || "").trim();
  const isUseless =
    !raw ||
    raw === title ||
    raw === pkg.displayName ||
    raw === pkg.name;

  const devicePart = pkg.maxDevices
    ? `最多仅限 ${pkg.maxDevices} 台设备同时使用`
    : "设备数量不限制";
  const validity = buildValidityText(pkg);

  if (!isUseless) return raw;
  if (validity) return `${validity}，${devicePart}`;
  return devicePart;
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
  return texts
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    // 积分额度已在「赠送积分」区块展示，不再重复进权限列表
    .filter(
      (label) =>
        !/套餐积分额度内调用|积分额度内调用|^积分额度|^无限积分|^套餐积分额度/.test(
          label,
        ),
    );
};

/** 黄框：仅展示后台配置的权限文案，不做额度/描述兜底 */
const getPackageFeatures = (pkg) => {
  return extractFeatureLabels(pkg).map((label) => ({
    label,
    included: true,
  }));
};

const formatPrice = (price) => formatPackagePrice(price);

const formatGiftQuota = (quota) => {
  if (quota === null || quota === undefined || quota === "") return "无限";
  const quotaNum = typeof quota === "string" ? parseFloat(quota) : Number(quota);
  if (!Number.isFinite(quotaNum)) return "无限";
  if (Number.isInteger(quotaNum) || Math.abs(quotaNum - Math.round(quotaNum)) < 1e-9) {
    return String(Math.round(quotaNum));
  }
  return parseFloat(quotaNum.toFixed(2)).toString();
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
    const response = await getFeatureCompare(tiers.map((t) => t.roleKey));
    if (response.success && response.data?.rows) {
      compareRows.value = Array.isArray(response.data.rows)
        ? response.data.rows
        : [];
    } else {
      compareRows.value = [];
    }
  } catch (error) {
    console.error("加载版本对比失败:", error);
    compareRows.value = [];
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
  --pricing-accent: #111111;
  --pricing-accent-soft: rgba(17, 17, 17, 0.12);
  --pricing-warm: #57534e;

  min-height: 100vh;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(17, 17, 17, 0.06), transparent 46%),
    radial-gradient(ellipse at 88% 8%, rgba(82, 82, 82, 0.05), transparent 40%),
    linear-gradient(180deg, #f7f7f4 0%, #f2f1ed 48%, #f7f7f4 100%);
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
  gap: 14px;
  margin-bottom: 40px;
}

/* 左右侧胶囊：统一轨道色与圆角，弱化实心黑块 */
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
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.toolbar-pill:hover {
  background: rgba(28, 25, 23, 0.09);
  color: var(--pricing-ink);
}

.toolbar-pill.is-active {
  background: rgba(28, 25, 23, 0.88);
  color: #faf7f2;
  box-shadow: 0 6px 16px rgba(28, 25, 23, 0.12);
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
  min-height: 520px;
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
  border-color: rgba(17, 17, 17, 0.45);
  box-shadow:
    0 0 0 1px rgba(17, 17, 17, 0.18),
    0 18px 40px rgba(17, 17, 17, 0.1);
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
  background: rgba(87, 83, 78, 0.12);
  color: var(--pricing-warm);
  font-size: 11px;
  font-weight: 700;
}

.buy-btn {
  width: 100%;
  margin-bottom: 16px;
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
  background: #000000;
}

.buy-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.gift-quota {
  margin-bottom: 16px;
  padding: 14px 14px 12px;
  border-radius: 14px;
  background: rgba(28, 25, 23, 0.035);
  border: 1px solid var(--pricing-line);
}

.gift-quota__head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin-bottom: 8px;
}

.gift-quota__title {
  font-size: 13px;
  font-weight: 750;
  color: var(--pricing-accent);
}

.gift-quota__note {
  font-size: 12px;
  color: var(--pricing-muted);
}

.gift-quota__note::before {
  content: "(";
}

.gift-quota__note::after {
  content: ")";
}

.gift-quota__amount {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}

.gift-quota__value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  font-family: "Space Grotesk", sans-serif;
  color: var(--pricing-ink);
}

.gift-quota__unit {
  font-size: 13px;
  font-weight: 650;
  color: var(--pricing-muted);
}

.gift-quota__usage {
  padding-top: 12px;
  border-top: 1px solid var(--pricing-line);
}

.gift-quota__usage-label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--pricing-muted);
}

.gift-quota__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.gift-quota__tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 8px;
  background: rgba(255, 253, 249, 0.9);
  border: 1px solid var(--pricing-line);
  font-size: 11px;
  font-weight: 650;
  color: rgba(28, 25, 23, 0.78);
  line-height: 1.3;
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
    gap: 10px;
  }

  .toolbar-pill {
    width: 100%;
    min-height: 40px;
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
