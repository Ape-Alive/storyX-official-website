<template>
  <!-- PC：单页卡片网格 -->
  <AccountDesktop v-if="!isMobile" />

  <!-- 移动：枢纽 / 子页 -->
  <div v-else class="mobile-account">
    <div v-if="isHub" class="mobile-hub">
      <section class="hub-profile">
        <div class="hub-profile__avatar">{{ userInitials }}</div>
        <div class="hub-profile__meta">
          <div class="hub-profile__name-row">
            <span class="hub-profile__name">{{ displayName }}</span>
            <span v-if="hasActivePackage" class="hub-vip">VIP</span>
          </div>
          <div class="hub-profile__email">{{ displayEmail }}</div>
          <div v-if="userId" class="hub-profile__id">
            <span>ID {{ maskedUserId }}</span>
            <button type="button" class="hub-copy" @click="copyUserId">复制</button>
          </div>
        </div>
        <router-link class="hub-edit" to="/dashboard/account/profile">编辑资料</router-link>
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
import { showSuccessToast, showFailToast } from 'vant'
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

const copyUserId = async () => {
  if (!userId.value) return
  try {
    await navigator.clipboard.writeText(userId.value)
    showSuccessToast('已复制用户 ID')
  } catch {
    showFailToast('复制失败')
  }
}

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

.hub-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-radius: 16px;
  border: 1px solid rgba(28, 25, 23, 0.08);
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, rgba(28, 25, 23, 0.08), transparent 55%),
    linear-gradient(135deg, #f4f3f1 0%, #ebeae7 100%);
  color: #1c1917;
  margin-bottom: 12px;
}

.hub-profile__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.hub-profile__meta {
  flex: 1;
  min-width: 0;
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
  background: #111;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.hub-profile__email,
.hub-profile__id {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.55);
  word-break: break-all;
}

.hub-profile__id {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hub-copy {
  border: 1px solid rgba(28, 25, 23, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 650;
  color: #1c1917;
  cursor: pointer;
}

.hub-edit {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.9);
  color: #1c1917;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
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
