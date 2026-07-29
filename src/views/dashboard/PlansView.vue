<template>
  <div class="plans-view" :class="{ 'is-mobile': isMobile }">
    <section v-if="isMobile" class="mobile-active-plans" v-loading="activePlansLoading">
      <div class="mobile-active-plans__header">
        <h2 class="mobile-active-plans__title">活跃套餐</h2>
        <van-button type="primary" size="small" round icon="plus" @click="scrollToBuy">
          购买
        </van-button>
      </div>

      <van-empty
        v-if="!activePlansLoading && activePlans.length === 0"
        image="search"
        description="暂无活跃套餐"
      >
        <van-button round type="primary" size="small" @click="scrollToBuy">
          立即购买套餐
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
          :percentage="planPercentage(plan)"
          :stroke-width="8"
          :color="plan.status === 'warning' ? '#f59e0b' : '#9333ea'"
          track-color="rgba(28,25,23,0.06)"
          pivot-text=""
        />
        <div class="mobile-active-plan-card__stats">
          <span>已用 {{ formatQuota(plan.used) }}</span>
          <span>剩余 {{ formatQuota(plan.remaining ?? Math.max((plan.limit || 0) - (plan.used || 0), 0)) }}</span>
        </div>
      </div>
    </section>

    <div class="plans-header">
      <h2 class="plans-title">选择您的算力规模</h2>
      <p class="plans-desc">
        根据您的制片强度选择合适的配额，支持随时横向扩展。
      </p>
    </div>

    <div class="duration-selector-wrapper">
      <van-tabs
        v-if="isMobile"
        v-model:active="selectedDuration"
        shrink
        type="card"
        class="mobile-duration-tabs"
        @change="handleDurationChange"
      >
        <van-tab
          v-for="duration in durations"
          :key="duration.value"
          :name="duration.value"
          :title="duration.discount ? `${duration.label} ${duration.discount}` : duration.label"
        />
      </van-tabs>
      <div v-else class="duration-selector">
        <button
          v-for="duration in durations"
          :key="duration.value"
          type="button"
          :class="['duration-btn', { active: selectedDuration === duration.value }]"
          @click="handleDurationChange(duration.value)"
        >
          <span>{{ duration.label }}</span>
          <span v-if="duration.discount" class="discount-badge">{{ duration.discount }}</span>
        </button>
      </div>
    </div>

    <div v-if="isMobile" class="mobile-plans" v-loading="loading">
      <van-empty v-if="!loading && plans.length === 0" description="当前周期暂无可用套餐" />
      <div
        v-for="(plan, idx) in plans"
        :key="plan.id || idx"
        class="mobile-plan-card"
        :class="{ popular: plan.popular, current: plan.current }"
      >
        <van-tag v-if="plan.popular" class="mobile-popular-tag" type="primary" round>最受欢迎</van-tag>
        <van-tag v-if="plan.current" class="mobile-current-tag" type="success" plain round>当前套餐</van-tag>
        <h3 class="mobile-plan-name">{{ plan.name }}</h3>
        <p v-if="plan.desc" class="mobile-plan-desc">{{ plan.desc }}</p>
        <div class="mobile-plan-price">
          <span class="price-value">¥{{ plan.price }}</span>
          <span class="price-unit">{{ getPriceUnit() }}</span>
        </div>
        <div v-if="plan.hasDiscount" class="mobile-plan-discount">
          <span class="price-original">¥{{ plan.originalPrice }}</span>
          <span class="discount-badge-inline">{{ plan.discountLabel }}</span>
          <span class="discount-saved">省¥{{ plan.savedAmount }}</span>
        </div>
        <div class="mobile-plan-features">
          <div v-for="(feature, i) in plan.features" :key="i" class="mobile-feature">
            <van-icon name="arrow" color="#9333ea" />
            <span>{{ feature }}</span>
          </div>
        </div>
        <van-button
          block
          round
          type="primary"
          class="mobile-plan-btn"
          :disabled="plan.buttonStatus?.disabled"
          @click="handleSelectPlan(plan)"
        >
          {{ plan.buttonStatus?.text || '立即选择' }}
        </van-button>
      </div>

      <div class="mobile-custom-card" @click="handleContact">
        <div class="mobile-custom-icon">
          <van-icon name="plus" size="22" color="#9333ea" />
        </div>
        <div class="mobile-custom-body">
          <h4>定制方案</h4>
          <p>需要算力集群或独立服务器部署？</p>
        </div>
        <van-icon name="arrow" color="#9333ea" />
      </div>
    </div>

    <div v-else class="plans-container" v-loading="loading">
      <button
        v-if="totalCardsCount > 1"
        class="nav-btn nav-btn-left"
        type="button"
        @click="scrollLeft"
        :disabled="!canScrollLeft"
      >
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>

      <div
        class="plans-grid"
        ref="plansGridRef"
        :class="{
          'single-plan': totalCardsCount === 1,
          'centered-plans': totalCardsCount <= 2,
        }"
      >
        <div
          v-for="(plan, idx) in plans"
          :key="idx"
          class="plan-card"
          :class="{ popular: plan.popular, current: plan.current }"
        >
          <div v-if="plan.popular" class="popular-badge">最受欢迎</div>
          <div class="plan-header">
            <div class="plan-title-wrapper">
              <h3 class="plan-title">{{ plan.name }}</h3>
              <div v-if="plan.current" class="current-badge">当前套餐</div>
            </div>
            <p class="plan-desc">{{ plan.desc }}</p>
            <div class="plan-price">
              <span class="price-value">¥{{ plan.price }}</span>
              <span class="price-unit">{{ getPriceUnit() }}</span>
            </div>
            <div v-if="plan.hasDiscount" class="plan-discount">
              <span class="price-original">¥{{ plan.originalPrice }}</span>
              <span class="discount-badge-inline">{{ plan.discountLabel }}</span>
              <span class="discount-saved">省¥{{ plan.savedAmount }}</span>
            </div>
          </div>
          <div class="plan-features">
            <div v-for="(feature, i) in plan.features" :key="i" class="feature-item">
              <div class="feature-icon">
                <el-icon :size="12"><ArrowRight /></el-icon>
              </div>
              {{ feature }}
            </div>
          </div>
          <button
            type="button"
            :class="['plan-btn', { disabled: plan.buttonStatus?.disabled }]"
            :disabled="plan.buttonStatus?.disabled"
            @click="handleSelectPlan(plan)"
          >
            {{ plan.buttonStatus?.text || "立即选择" }}
          </button>
        </div>

        <div v-if="plans.length < 3" class="plan-card custom-plan-card">
          <div class="custom-plan-content">
            <div class="custom-plan-icon">
              <el-icon :size="24" color="var(--accent-color)"><Plus /></el-icon>
            </div>
            <h3 class="custom-plan-title">定制方案</h3>
            <p class="custom-plan-desc">
              需要算力算集群<br />
              或独立服务器部署?
            </p>
            <a href="#" class="custom-plan-link" @click.prevent="handleContact">
              联系我们 >
            </a>
          </div>
        </div>
      </div>

      <button
        v-if="totalCardsCount > 1"
        class="nav-btn nav-btn-right"
        type="button"
        @click="scrollRight"
        :disabled="!canScrollRight"
      >
        <el-icon :size="20"><ArrowRight /></el-icon>
      </button>
    </div>

    <PaymentCheckout
      v-model:visible="checkoutVisible"
      :pkg="checkoutPkg"
      :order-type="checkoutOrderType"
      :price-unit="getPriceUnit()"
      @success="onCheckoutSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, ArrowLeft, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getAvailablePackages, getMyPackages } from "@/api/pricing";
import PaymentCheckout from "@/components/PaymentCheckout.vue";
import { useDevice } from "@/utils/device";
import { useMyActivePackages } from "@/composables/useMyActivePackages";
import { useDashboardPageBoot } from "@/composables/useDashboardPageBoot";
import {
  getPackagePayableAmount,
  getPackageDiscountInfo,
  formatPackagePrice,
  formatDiscountLabel,
} from "@/utils/packagePrice";

const router = useRouter();
const { isMobile } = useDevice();
const { runPageBoot } = useDashboardPageBoot();
const {
  plans: activePlans,
  loading: activePlansLoading,
  formatQuota,
  planPercentage,
  loadMyPackages: loadActivePackages,
} = useMyActivePackages({ immediate: false });

const scrollToBuy = () => {
  document
    .querySelector(".duration-selector-wrapper")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};
const checkoutVisible = ref(false);
const checkoutPkg = ref(null);
const checkoutOrderType = ref("purchase");

// 时长选项
const durations = [
  { value: "day", label: "按天" },
  { value: "month", label: "按月" },
  { value: "year", label: "按年" },
  { value: "permanent", label: "永久" },
];

const selectedDuration = ref("month");
const packages = ref([]);
const loading = ref(false);
const myPackages = ref([]); // 用户已购买的套餐列表

// 处理时长切换
const handleDurationChange = (duration) => {
  selectedDuration.value = duration;
  loadPackages();
};

// 加载我的套餐列表
const loadMyPackages = async () => {
  try {
    const response = await getMyPackages({ activeOnly: false });
    if (response.success && response.data) {
      myPackages.value = response.data;
    }
  } catch (error) {
    console.error("加载我的套餐失败:", error);
    // 不显示错误提示，避免影响用户体验
  }
};

// 加载套餐数据
const loadPackages = async () => {
  try {
    loading.value = true;

    // 先加载我的套餐列表（如果还没有加载）
    if (myPackages.value.length === 0) {
      await loadMyPackages();
    }

    // 根据选中的时长确定 durationUnit 参数
    let durationUnit = null;
    if (selectedDuration.value === "permanent") {
      durationUnit = "permanent";
    } else {
      durationUnit = selectedDuration.value;
    }

    const availableResponse = await getAvailablePackages("paid", durationUnit);

    if (availableResponse.success && availableResponse.data) {
      // 根据 durationUnit 再次筛选套餐（双重保险）
      let filtered = availableResponse.data;
      if (selectedDuration.value === "permanent") {
        filtered = availableResponse.data.filter((pkg) => !pkg.durationUnit);
      } else {
        filtered = availableResponse.data.filter(
          (pkg) => pkg.durationUnit === selectedDuration.value,
        );
      }

      // 转换为组件需要的格式，并匹配用户已购买的套餐
      plans.value = filtered.map((pkg) => {
        // 查找用户是否已购买此套餐
        const myPackage = myPackages.value.find(
          (mp) => mp.packageId === pkg.id,
        );

        let buttonStatus = {
          disabled: false,
          text: "立即选择",
        };

        if (myPackage) {
          // 如果套餐状态是 active，说明已购买且未失效，禁用按钮
          if (myPackage.status === "active") {
            buttonStatus = {
              disabled: true,
              text: "当前已选择套餐",
            };
          } else if (
            myPackage.status === "expired" ||
            myPackage.status === "no_quota"
          ) {
            // 如果套餐已过期或积分用完，可以复购
            buttonStatus = {
              disabled: false,
              text: "复购",
            };
          }
        }

        const info = getPackageDiscountInfo(pkg);

        return {
          id: pkg.id,
          name: pkg.displayName || pkg.name,
          price: formatPrice(info.payable),
          originalPrice: formatPrice(info.original),
          hasDiscount: info.hasDiscount,
          discountLabel: formatDiscountLabel(info.discount),
          savedAmount: formatPrice(info.saved),
          desc: pkg.description || "",
          features: getPackageFeatures(pkg),
          current: myPackage?.status === "active", // 当前正在使用的套餐
          popular: pkg.priority > 0, // 可以根据优先级判断
          buttonStatus, // 按钮状态
          // 保存原始套餐信息，用于复购
          originalPackage: pkg,
          myPackageId: myPackage?.id, // 用户套餐ID，用于复购
        };
      });
    }
  } catch (error) {
    console.error("加载套餐失败:", error);
    ElMessage.error("加载套餐信息失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 格式化价格
const formatPrice = (price) => formatPackagePrice(price);

// 获取套餐特性列表：优先权限文案
const getPackageFeatures = (pkg) => {
  const texts =
    (Array.isArray(pkg.effectivePermissionTexts) && pkg.effectivePermissionTexts) ||
    (Array.isArray(pkg.permissionTexts) && pkg.permissionTexts) ||
    (Array.isArray(pkg.clientRole?.permissionTexts) &&
      pkg.clientRole.permissionTexts) ||
    [];
  const labels = texts.map((item) => String(item || "").trim()).filter(Boolean);
  if (labels.length > 0) return labels;

  const features = [];
  if (pkg.quota != null && pkg.quota !== "") {
    const quotaNum =
      typeof pkg.quota === "string" ? parseFloat(pkg.quota) : pkg.quota;
    if (Number.isFinite(quotaNum)) {
      if (quotaNum >= 1000) {
        features.push(`积分额度 ${(quotaNum / 1000).toFixed(0)}K点`);
      } else {
        features.push(`积分额度 ${quotaNum}点`);
      }
    }
  }

  if (pkg.maxDevices) {
    features.push(`多端登录 ${pkg.maxDevices}台`);
  } else {
    features.push("多端登录 不限制");
  }

  if (pkg.description) {
    features.push(pkg.description);
  }

  return features.length > 0 ? features : ["标准功能", "API 接入", "技术支持"];
};

// 格式化价格单位
const getPriceUnit = () => {
  const unitMap = {
    day: "/天",
    month: "/月",
    year: "/年",
    permanent: "一次性",
  };
  return unitMap[selectedDuration.value] || "/月";
};

const plans = ref([]);
const plansGridRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// 计算总卡片数（包括定制方案卡片）
const totalCardsCount = computed(() => {
  const planCount = plans.value.length;
  const customCardCount = planCount < 3 ? 1 : 0;
  return planCount + customCardCount;
});

// 检查滚动状态
const checkScrollButtons = () => {
  if (!plansGridRef.value) return;

  const container = plansGridRef.value;
  canScrollLeft.value = container.scrollLeft > 0;
  canScrollRight.value =
    container.scrollLeft < container.scrollWidth - container.clientWidth - 10;
};

// 向左滚动
const scrollLeft = () => {
  if (!plansGridRef.value) return;
  const container = plansGridRef.value;
  const cardWidth = 320; // 卡片宽度
  const gap = 32; // 间距
  const scrollAmount = cardWidth + gap;

  container.scrollBy({
    left: -scrollAmount,
    behavior: "smooth",
  });

  // 延迟检查滚动状态
  setTimeout(checkScrollButtons, 300);
};

// 向右滚动
const scrollRight = () => {
  if (!plansGridRef.value) return;
  const container = plansGridRef.value;
  const cardWidth = 320; // 卡片宽度
  const gap = 32; // 间距
  const scrollAmount = cardWidth + gap;

  container.scrollBy({
    left: scrollAmount,
    behavior: "smooth",
  });

  // 延迟检查滚动状态
  setTimeout(checkScrollButtons, 300);
};

// 监听卡片数量变化，更新滚动状态
watch(
  () => plans.value.length,
  () => {
    nextTick(() => {
      checkScrollButtons();
    });
  },
);

// 处理联系我们
const handleContact = () => {
  router.push("/dashboard/contact");
};

// 处理套餐选择/复购
const handleSelectPlan = (plan) => {
  if (plan.buttonStatus?.disabled) {
    return;
  }

  const pkg = plan.originalPackage || {
    id: plan.id,
    displayName: plan.name,
    name: plan.name,
    price: plan.price,
    displayPrice: plan.price,
  };

  const payable = getPackagePayableAmount(pkg);
  checkoutPkg.value = {
    ...pkg,
    displayName: pkg.displayName || plan.name,
    displayPrice: payable,
  };
  checkoutOrderType.value =
    plan.buttonStatus?.text === "复购" ? "renewal" : "purchase";
  checkoutVisible.value = true;
};

const onCheckoutSuccess = () => {
  loadPackages();
};

// 窗口大小变化处理
const handleResize = () => {
  nextTick(() => {
    checkScrollButtons();
  });
};

// 初始化
onMounted(() => {
  runPageBoot(() =>
    Promise.allSettled([
      isMobile.value ? loadActivePackages() : Promise.resolve(),
      loadPackages(),
    ])
  );
  // 初始化滚动状态检查
  nextTick(() => {
    if (plansGridRef.value) {
      plansGridRef.value.addEventListener("scroll", checkScrollButtons);
      checkScrollButtons();
    }
  });

  // 监听窗口大小变化
  window.addEventListener("resize", handleResize);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  if (plansGridRef.value) {
    plansGridRef.value.removeEventListener("scroll", checkScrollButtons);
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.plans-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  color: var(--text-primary);
  transition: color 0.3s ease;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.plans-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 10px;
}

.plans-title {
  font-size: 40px;
  font-weight: 900;
  margin: 0 0 16px 0;
  color: var(--text-primary);
  transition: color 0.3s ease;
  font-family: "Space Grotesk", sans-serif;
}

.plans-desc {
  color: var(--text-secondary);
  margin: 0;
  font-family: "Inter", sans-serif;
  transition: color 0.3s ease;
}

/* 时长选择器 */
.duration-selector-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0px;
}

.duration-selector {
  background: var(--bg-card);
  padding: 6px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.duration-btn {
  position: relative;
  padding: 12px 28px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: none;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
  flex-shrink: 0;
}

.duration-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.duration-btn.active {
  background: var(--accent-color);
  color: white;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  transform: scale(1.02);
}

.discount-badge {
  position: absolute;
  top: -10px;
  right: -4px;
  background: #ec4899;
  color: white;
  font-size: 9px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);
  white-space: nowrap;
}

/* 套餐容器 */
.plans-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: flex-start; /* 改为 flex-start，允许标签超出 */
  gap: 16px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 20px 60px 0; /* 顶部留出空间给标签 */
  overflow: visible; /* 改为 visible，允许标签显示 */
}

/* 响应式宽度调整 - 确保容器宽度随窗口变化 */
@media (min-width: 768px) {
  .plans-container {
    padding: 20px 60px 0;
  }
}

@media (min-width: 1200px) {
  .plans-container {
    padding: 20px 60px 0;
  }
}

/* 导航按钮 */
.nav-btn {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.nav-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn-left {
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
}

.nav-btn-right {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
}

.plans-grid {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 32px;
  overflow-x: auto;
  overflow-y: visible; /* 改为 visible，允许标签超出容器 */
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  width: 100%;
  max-width: 100%;
  flex: 1 1 0; /* 重要：允许 flex 子元素缩小，不会撑开父容器 */
  min-width: 0; /* 重要：允许 flex 子元素缩小 */
  box-sizing: border-box;
  padding-top: 20px; /* 为标签留出空间 */
  margin-top: -20px; /* 抵消 padding-top 对布局的影响 */
}

/* 隐藏滚动条 */
.plans-grid::-webkit-scrollbar {
  display: none;
}

/* 卡片等宽，高度跟随最高卡片 */
.plans-grid .plan-card,
.plans-grid .custom-plan-card {
  width: 320px;
  height: auto;
  min-height: 0;
  flex: 0 0 320px;
  max-width: 320px;
  align-self: stretch;
}

/* 当只有一个或两个卡片时，居中显示 */
.plans-grid.single-plan,
.plans-grid.centered-plans {
  justify-content: center;
}

.plan-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  transition: all 0.5s;
  position: relative;
  box-shadow: var(--shadow-sm);
  overflow: visible;
}

.plan-card:hover {
  transform: translateY(-12px);
}

.plan-card.popular {
  border-color: rgba(147, 51, 234, 0.2);
  box-shadow: 0 20px 50px rgba(147, 51, 234, 0.1);
  border-width: 4px;
  border-style: solid;
  border-image: linear-gradient(
      to right,
      rgba(147, 51, 234, 0.2),
      rgba(236, 72, 153, 0.2)
    )
    1;
}

.popular-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 24px;
  background: var(--accent-gradient);
  color: white;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  font-family: "Inter", sans-serif;
}

.plan-header {
  margin-bottom: 32px;
}

.plan-title-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.plan-title {
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  line-height: 1.2;
  word-break: keep-all;
  white-space: normal;
  flex: 1;
  min-width: 0;
}

.current-badge {
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  font-size: 10px;
  font-weight: 900;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: "Inter", sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.2;
}

.plan-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  margin: 0 0 24px 0;
  font-weight: 500;
  letter-spacing: 0.05em;
  font-family: "Inter", sans-serif;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.plan-discount,
.mobile-plan-discount {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.price-original {
  font-size: 13px;
  color: var(--text-tertiary);
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

.price-value {
  font-size: 48px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.02em;
  font-family: "Space Grotesk", sans-serif;
}

.price-unit {
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "Inter", sans-serif;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  flex: 1 1 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
  font-weight: 700;
  font-family: "Inter", sans-serif;
}

.feature-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.plan-btn {
  width: 100%;
  margin-top: auto;
  padding: 20px;
  border-radius: 16px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}

.plan-btn:not(.disabled) {
  background: black;
  color: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.plan-btn:not(.disabled):hover {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 12px 40px rgba(147, 51, 234, 0.2);
}

.plan-btn.disabled {
  background: var(--bg-tertiary);
  color: var(--text-disabled);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  cursor: default;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 定制方案卡片 */
.custom-plan-card {
  border: 2px dashed var(--accent-color);
  background: linear-gradient(
    135deg,
    rgba(147, 51, 234, 0.05) 0%,
    rgba(147, 51, 234, 0.02) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-plan-card:hover {
  border-color: var(--accent-color);
  background: linear-gradient(
    135deg,
    rgba(147, 51, 234, 0.08) 0%,
    rgba(147, 51, 234, 0.04) 100%
  );
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.15);
}

.custom-plan-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.custom-plan-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  margin-bottom: 8px;
}

.custom-plan-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--accent-color);
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.custom-plan-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-family: "Inter", sans-serif;
}

.custom-plan-link {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  font-family: "Inter", sans-serif;
  margin-top: 8px;
}

.custom-plan-link:hover {
  color: var(--accent-color-light);
  transform: translateX(4px);
}

@media (max-width: 960px) {
  .plans-view.is-mobile {
    padding-top: 0;
    padding-bottom: 8px;
    gap: 12px;
  }

  .mobile-active-plans {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mobile-active-plans__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .mobile-active-plans__title {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.25;
    color: var(--text-primary);
    font-family: "Space Grotesk", sans-serif;
  }

  .mobile-active-plan-card {
    padding: 14px;
    border-radius: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
  }

  .mobile-active-plan-card.is-warning {
    border-color: rgba(245, 158, 11, 0.35);
  }

  .mobile-active-plan-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .mobile-active-plan-card__name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .mobile-active-plan-card__expiry {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .mobile-active-plan-card__stats {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 600;
  }

  .plans-title {
    font-size: 22px;
    margin: 0 0 8px;
    line-height: 1.25;
  }

  .plans-desc {
    font-size: 13px;
    padding: 0;
    line-height: 1.5;
  }

  .plans-header {
    margin: 0;
    text-align: left;
    max-width: none;
  }

  .duration-selector-wrapper {
    padding: 0;
    margin-bottom: 0;
  }

  .mobile-duration-tabs {
    width: 100%;
  }

  .mobile-duration-tabs :deep(.van-tabs__nav--card) {
    margin: 0;
    border-radius: 12px;
  }

  .mobile-plans {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 120px;
  }

  .mobile-plan-card {
    position: relative;
    padding: 18px 14px 14px;
    border-radius: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  .mobile-plan-card.popular {
    border-color: rgba(147, 51, 234, 0.35);
  }

  .mobile-popular-tag {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
  }

  .mobile-current-tag {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .mobile-plan-name {
    margin: 6px 0 4px;
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
    font-family: "Space Grotesk", sans-serif;
  }

  .mobile-plan-desc {
    margin: 0 0 10px;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .mobile-plan-price {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 12px;
  }

  .mobile-plan-price .price-value {
    font-size: 32px;
    font-weight: 900;
    color: var(--text-primary);
    font-family: "Space Grotesk", sans-serif;
  }

  .mobile-plan-price .price-unit {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .mobile-plan-features {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 14px;
  }

  .mobile-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .mobile-plan-btn {
    --van-button-primary-background: #1c1917;
    --van-button-primary-border-color: #1c1917;
    font-weight: 700;
  }

  .mobile-custom-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 16px;
    background: rgba(147, 51, 234, 0.06);
    border: 1px dashed rgba(147, 51, 234, 0.35);
    cursor: pointer;
  }

  .mobile-custom-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mobile-custom-body {
    flex: 1;
    min-width: 0;
  }

  .mobile-custom-body h4 {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 700;
    color: var(--accent-color);
  }

  .mobile-custom-body p {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
  }
}
</style>
