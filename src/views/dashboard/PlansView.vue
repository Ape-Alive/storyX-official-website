<template>
  <div class="plans-view">
    <div class="plans-header">
      <h2 class="plans-title">选择您的算力规模</h2>
      <p class="plans-desc">
        根据您的制片强度选择合适的配额，支持随时横向扩展。
      </p>
    </div>

    <!-- 时长选择器 -->
    <div class="duration-selector-wrapper">
      <div class="duration-selector">
        <button
          v-for="duration in durations"
          :key="duration.value"
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

    <div class="plans-container" v-loading="loading">
      <!-- 左导航按钮 -->
      <button
        v-if="totalCardsCount > 1"
        class="nav-btn nav-btn-left"
        @click="scrollLeft"
        :disabled="!canScrollLeft"
      >
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>

      <!-- 卡片容器 -->
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
          </div>
          <div class="plan-features">
            <div
              v-for="(feature, i) in plan.features"
              :key="i"
              class="feature-item"
            >
              <div class="feature-icon">
                <el-icon :size="12"><ArrowRight /></el-icon>
              </div>
              {{ feature }}
            </div>
          </div>
          <button
            :class="['plan-btn', { disabled: plan.buttonStatus?.disabled }]"
            :disabled="plan.buttonStatus?.disabled"
            @click="handleSelectPlan(plan)"
          >
            {{ plan.buttonStatus?.text || "立即选择" }}
          </button>
        </div>

        <!-- 定制方案卡片（当套餐少于3个时显示） -->
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

      <!-- 右导航按钮 -->
      <button
        v-if="totalCardsCount > 1"
        class="nav-btn nav-btn-right"
        @click="scrollRight"
        :disabled="!canScrollRight"
      >
        <el-icon :size="20"><ArrowRight /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { ArrowRight, ArrowLeft, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getAvailablePackages, getMyPackages } from "@/api/pricing";

// 时长选项
const durations = [
  { value: "day", label: "按天" },
  { value: "month", label: "按月" },
  { value: "year", label: "按年", discount: "首 20%" },
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

        return {
          id: pkg.id,
          name: pkg.displayName || pkg.name,
          price: formatPrice(pkg.price),
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
const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return "0";
  }
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(priceNum)) {
    return "0";
  }
  // 如果是小数且小于1，保留一位小数；否则显示整数
  if (priceNum < 1 && priceNum > 0) {
    return priceNum.toFixed(1);
  }
  return Math.round(priceNum).toString();
};

// 获取套餐特性列表
const getPackageFeatures = (pkg) => {
  const features = [];

  if (pkg.quota) {
    const quotaNum =
      typeof pkg.quota === "string" ? parseFloat(pkg.quota) : pkg.quota;
    if (quotaNum >= 1000) {
      features.push(`积分额度 ${(quotaNum / 1000).toFixed(0)}K点`);
    } else {
      features.push(`积分额度 ${quotaNum}点`);
    }
  }

  if (pkg.maxDevices) {
    features.push(`多端登录 ${pkg.maxDevices}台`);
  } else {
    features.push("多端登录 不限制");
  }

  // 可以根据套餐的其他属性添加更多特性
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
  // TODO: 实现联系我们的逻辑，可以跳转到联系页面或打开联系弹窗
  ElMessage.info("请联系客服获取定制方案");
};

// 处理套餐选择/复购
const handleSelectPlan = (plan) => {
  if (plan.buttonStatus?.disabled) {
    return;
  }

  // 如果是复购，显示提示信息
  if (plan.buttonStatus?.text === "复购") {
    ElMessage.info(`正在为您复购套餐：${plan.name}`);
    // TODO: 这里可以调用复购接口
    // 例如：repurchasePackage(plan.myPackageId)
  } else {
    // 新购买套餐
    ElMessage.info(`正在为您购买套餐：${plan.name}`);
    // TODO: 这里可以调用购买接口
    // 例如：purchasePackage(plan.id)
  }
};

// 窗口大小变化处理
const handleResize = () => {
  nextTick(() => {
    checkScrollButtons();
  });
};

// 初始化
onMounted(() => {
  loadPackages();
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

/* 所有卡片固定宽度和高度 */
.plans-grid .plan-card,
.plans-grid .custom-plan-card {
  width: 320px;
  height: 520px;
  flex: 0 0 320px;
  max-width: 320px;
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
  margin-bottom: 40px;
  flex: 1;
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
</style>
