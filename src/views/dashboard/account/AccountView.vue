<template>
  <!-- PC：单页卡片网格 -->
  <AccountDesktop v-if="!isMobile" />

  <!-- 移动：枢纽 / 子页 -->
  <div v-else class="mobile-account">
    <div v-if="isHub" class="mobile-hub">
      <header class="mobile-hub__head">
        <h1 class="mobile-hub__title">个人中心</h1>
        <p class="mobile-hub__desc">账户、套餐与支持</p>
      </header>

      <section class="hub-profile">
        <div class="hub-profile__avatar">{{ userInitials }}</div>
        <div class="hub-profile__meta">
          <div class="hub-profile__name-row">
            <span class="hub-profile__name">{{ displayName }}</span>
            <span v-if="hasActivePackage" class="hub-vip">VIP</span>
          </div>
          <div class="hub-profile__email">{{ displayEmail }}</div>
          <div v-if="userId" class="hub-profile__id">ID {{ maskedUserId }}</div>
        </div>
      </section>

      <div class="hub-stats">
        <div class="hub-stat">
          <div class="hub-stat__value">{{ vipLabel }}</div>
          <div class="hub-stat__label">当前会员</div>
        </div>
        <div class="hub-stat">
          <div class="hub-stat__value">{{ remainingQuotaText }}</div>
          <div class="hub-stat__label">剩余积分</div>
        </div>
        <div class="hub-stat">
          <div class="hub-stat__value">{{ packagesCount }}</div>
          <div class="hub-stat__label">已购套餐</div>
        </div>
      </div>

      <van-cell-group inset class="hub-menu">
        <van-cell
          v-for="item in mobileAccountMenus"
          :key="item.id"
          :title="item.label"
          :label="item.desc"
          :icon="item.vantIcon"
          is-link
          :to="item.path"
        />
      </van-cell-group>

      <section class="hub-support">
        <div class="hub-support__text">
          <div class="hub-support__title">需要帮助？</div>
          <div class="hub-support__desc">技术支持与采购咨询</div>
        </div>
        <router-link class="hub-support__btn" to="/dashboard/account/contact">
          联系咨询
        </router-link>
      </section>
    </div>

    <div v-else class="mobile-sub">
      <button type="button" class="mobile-back" @click="goHub">
        <van-icon name="arrow-left" />
        <span>返回</span>
      </button>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDevice } from '@/utils/device'
import { getUserInfo } from '@/utils/storage'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'
import { getMyPackages } from '@/api/pricing'
import { formatQuota, isUnlimitedQuota } from '@/composables/useMyActivePackages'
import { mobileAccountMenus } from '@/config/accountNav'
import AccountDesktop from './AccountDesktop.vue'

const route = useRoute()
const router = useRouter()
const { isMobile } = useDevice()
const { runPageBoot, finishPageBoot } = useDashboardPageBoot()

const isHub = computed(
  () => route.path === '/dashboard/account' || route.path === '/dashboard/account/',
)

const user = computed(() => getUserInfo() || {})
const displayEmail = computed(() => user.value.email || '—')
const displayName = computed(() => {
  if (user.value.name) return user.value.name
  const email = user.value.email || ''
  return email.split('@')[0] || '用户'
})
const userId = computed(() => user.value.id || user.value.userId || '')
const userInitials = computed(() => {
  const email = user.value.email || 'U'
  return (email.split('@')[0] || 'U').substring(0, 2).toUpperCase()
})
const maskedUserId = computed(() => {
  const id = userId.value
  if (!id || id.length < 8) return '••••••••'
  return `${id.slice(0, 4)}••••${id.slice(-4)}`
})

const packages = ref([])
const hasActivePackage = computed(() =>
  packages.value.some((p) => p.status === 'active'),
)
const packagesCount = computed(() => packages.value.length)
const vipLabel = computed(() => {
  const active = packages.value.find((p) => p.status === 'active')
  if (!active) return '未开通'
  const name = active.package?.displayName || active.package?.name || '会员'
  return name.length > 6 ? `${name.slice(0, 6)}…` : name
})
const remainingQuotaText = computed(() => {
  const active = packages.value.filter((p) => p.status === 'active')
  if (!active.length) return '—'
  if (active.some((p) => isUnlimitedQuota(p.package?.quota))) return '无限'
  const sum = active.reduce((acc, p) => {
    const info = p.quotaInfo || {}
    const remaining =
      info.remaining != null
        ? Number(info.remaining) || 0
        : Math.max((Number(info.total) || 0) - (Number(info.used) || 0), 0)
    return acc + remaining
  }, 0)
  return formatQuota(sum)
})

const goHub = () => router.push('/dashboard/account')

const loadHubStats = async () => {
  try {
    const response = await getMyPackages({ activeOnly: false, page: 1, pageSize: 50 })
    packages.value = response.success && Array.isArray(response.data) ? response.data : []
  } catch {
    packages.value = []
  }
}

onMounted(() => {
  if (!isMobile.value) {
    finishPageBoot()
    return
  }
  if (isHub.value) {
    runPageBoot(() => loadHubStats())
  } else {
    finishPageBoot()
  }
})

watch(isHub, (hub) => {
  if (hub && isMobile.value) loadHubStats()
})
</script>

<style scoped>
.mobile-account {
  color: #1c1917;
  padding-bottom: 12px;
}

.mobile-hub__head {
  margin-bottom: 16px;
}

.mobile-hub__title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.mobile-hub__desc {
  margin: 0;
  font-size: 13px;
  color: rgba(28, 25, 23, 0.55);
}

.hub-profile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border-radius: 16px;
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, rgba(28, 25, 23, 0.1), transparent 55%),
    linear-gradient(135deg, #2a2725 0%, #111 100%);
  color: #fff;
  margin-bottom: 12px;
}

.hub-profile__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.hub-profile__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hub-profile__name {
  font-size: 17px;
  font-weight: 800;
}

.hub-vip {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fff;
  color: #111;
  font-size: 10px;
  font-weight: 800;
}

.hub-profile__email,
.hub-profile__id {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  word-break: break-all;
}

.hub-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.hub-stat {
  background: #fff;
  border: 1px solid rgba(28, 25, 23, 0.08);
  border-radius: 14px;
  padding: 12px 8px;
  text-align: center;
}

.hub-stat__value {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  word-break: break-all;
}

.hub-stat__label {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(28, 25, 23, 0.5);
  font-weight: 650;
}

.hub-menu {
  margin: 0 0 14px !important;
}

.hub-support {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(28, 25, 23, 0.1);
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, rgba(28, 25, 23, 0.06), transparent 55%),
    linear-gradient(135deg, #f4f3f1 0%, #ebeae7 100%);
}

.hub-support__title {
  font-size: 14px;
  font-weight: 800;
}

.hub-support__desc {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.55);
}

.hub-support__btn {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.mobile-sub {
  min-height: 40vh;
}

.mobile-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: rgba(28, 25, 23, 0.7);
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
}
</style>
