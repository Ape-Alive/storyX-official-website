<template>
  <div class="my-packages" :class="{ 'is-mobile': isMobile }" v-loading="loading">
    <header class="my-packages__header">
      <div>
        <h2 class="my-packages__title">我的套餐</h2>
        <p v-if="!isMobile" class="my-packages__desc">查看全部已购会员，含有效与已失效记录</p>
      </div>
      <button
        v-if="!isMobile"
        type="button"
        class="my-packages__renew"
        @click="goPlans"
      >
        去续费 / 购买
      </button>
    </header>

    <template v-if="isMobile">
      <van-empty v-if="!loading && packages.length === 0" description="暂无已购套餐">
        <van-button round type="primary" size="small" @click="goPlans">去购买</van-button>
      </van-empty>
      <van-cell-group v-else-if="packages.length" inset>
        <van-cell
          v-for="pkg in packages"
          :key="pkg.id"
          :title="pkg.name"
          :label="pkg.metaLine"
        >
          <template #value>
            <div class="mobile-pkg-value">
              <span :class="['status-tag', `is-${pkg.statusKey}`]">{{ pkg.statusLabel }}</span>
              <div class="mobile-pkg-quota">{{ pkg.quotaText }}</div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
      <div v-if="packages.length" class="mobile-renew-wrap">
        <van-button round block type="primary" @click="goPlans">去续费 / 购买</van-button>
      </div>
    </template>

    <template v-else>
      <div v-if="!loading && packages.length === 0" class="my-packages__empty">
        暂无已购套餐
        <button type="button" class="link-btn" @click="goPlans">去购买会员计划</button>
      </div>
      <article
        v-for="pkg in packages"
        :key="pkg.id"
        class="pkg-card"
      >
        <div class="pkg-card__main">
          <div class="pkg-card__title-row">
            <h3 class="pkg-card__name">{{ pkg.name }}</h3>
            <span :class="['status-tag', `is-${pkg.statusKey}`]">{{ pkg.statusLabel }}</span>
          </div>
          <p class="pkg-card__meta">{{ pkg.metaLine }}</p>
          <p v-if="pkg.unavailableReason" class="pkg-card__reason">{{ pkg.unavailableReason }}</p>
        </div>
        <div class="pkg-card__quota">
          <div class="pkg-card__quota-label">积分</div>
          <div class="pkg-card__quota-value">{{ pkg.quotaText }}</div>
          <div v-if="!pkg.unlimited" class="pkg-card__quota-sub">
            已用 {{ formatQuota(pkg.used) }} / 总量 {{ formatQuota(pkg.limit) }}
          </div>
        </div>
      </article>
    </template>

    <div v-if="pagination.total > pagination.pageSize" class="pagination-wrapper">
      <van-pagination
        v-if="isMobile"
        v-model="pagination.page"
        :total-items="pagination.total"
        :items-per-page="pagination.pageSize"
        force-ellipses
        @change="handlePageChange"
      />
      <el-pagination
        v-else
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyPackages } from '@/api/pricing'
import { formatQuota, isUnlimitedQuota } from '@/composables/useMyActivePackages'
import { useDevice } from '@/utils/device'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const { isMobile } = useDevice()
const { runPageBoot } = useDashboardPageBoot()

const packages = ref([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
})

const STATUS_LABEL = {
  active: '使用中',
  expired: '已过期',
  no_quota: '积分用尽',
  inactive: '已禁用',
  not_started: '未开始',
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const transformPackage = (item) => {
  const pkg = item.package || {}
  const statusKey = item.status || 'inactive'
  const unlimited = isUnlimitedQuota(pkg.quota)
  const info = item.quotaInfo || {}
  const total = unlimited ? null : Number(info.total) || 0
  const used = unlimited ? null : Number(info.used) || 0
  const remaining = unlimited
    ? null
    : info.remaining != null
      ? Number(info.remaining) || 0
      : Math.max(total - used, 0)

  const start = formatDate(item.startedAt)
  const end = item.expiresAt ? formatDate(item.expiresAt) : '永久'
  const metaLine = start ? `有效期 ${start} ~ ${end}` : `有效期至 ${end}`

  return {
    id: item.id,
    name: pkg.displayName || pkg.name || '未知套餐',
    statusKey,
    statusLabel: STATUS_LABEL[statusKey] || statusKey,
    unavailableReason: item.unavailableReason || '',
    unlimited,
    limit: total,
    used,
    remaining,
    quotaText: unlimited ? '无限积分' : `剩余 ${formatQuota(remaining)}`,
    metaLine,
  }
}

const loadPackages = async () => {
  loading.value = true
  try {
    const response = await getMyPackages({
      activeOnly: false,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    if (response.success && Array.isArray(response.data)) {
      packages.value = response.data.map(transformPackage)
      if (response.pagination) {
        pagination.value.total = response.pagination.total || packages.value.length
      } else {
        pagination.value.total = packages.value.length
      }
    } else {
      packages.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('加载已购套餐失败:', error)
    ElMessage.error('加载已购套餐失败，请稍后重试')
    packages.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadPackages()
}

const goPlans = () => {
  router.push('/dashboard/plans')
}

onMounted(() => {
  if (props.embedded) {
    loadPackages()
    return
  }
  runPageBoot(() => loadPackages())
})
</script>

<style scoped>
.my-packages {
  color: #1c1917;
  padding-top: 0;
}

.my-packages__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.my-packages__title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.my-packages__desc {
  margin: 0;
  font-size: 13px;
  color: rgba(28, 25, 23, 0.55);
}

.my-packages__renew {
  flex-shrink: 0;
  padding: 9px 16px;
  border: none;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.my-packages__renew:hover {
  background: #000;
}

.my-packages__empty {
  padding: 48px 16px;
  text-align: center;
  color: rgba(28, 25, 23, 0.55);
  font-size: 14px;
}

.link-btn {
  display: block;
  margin: 12px auto 0;
  border: none;
  background: transparent;
  color: #111;
  font-size: 14px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.pkg-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(28, 25, 23, 0.08);
}

.pkg-card:first-of-type {
  border-top: 1px solid rgba(28, 25, 23, 0.08);
}

.pkg-card__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.pkg-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.pkg-card__meta,
.pkg-card__reason {
  margin: 0;
  font-size: 13px;
  color: rgba(28, 25, 23, 0.55);
  line-height: 1.45;
}

.pkg-card__reason {
  margin-top: 4px;
  color: #a16207;
}

.pkg-card__quota {
  text-align: right;
  flex-shrink: 0;
  min-width: 120px;
}

.pkg-card__quota-label {
  font-size: 12px;
  color: rgba(28, 25, 23, 0.45);
  font-weight: 650;
}

.pkg-card__quota-value {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.pkg-card__quota-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.5);
}

.status-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(28, 25, 23, 0.08);
  color: rgba(28, 25, 23, 0.7);
}

.status-tag.is-active {
  background: rgba(17, 17, 17, 0.1);
  color: #111;
}

.status-tag.is-expired,
.status-tag.is-inactive {
  background: rgba(28, 25, 23, 0.06);
  color: rgba(28, 25, 23, 0.45);
}

.status-tag.is-no_quota {
  background: rgba(161, 98, 7, 0.12);
  color: #a16207;
}

.mobile-pkg-value {
  text-align: right;
}

.mobile-pkg-quota {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.55);
  font-weight: 650;
}

.mobile-renew-wrap {
  padding: 20px 16px 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.my-packages.is-mobile .my-packages__header {
  margin-bottom: 12px;
}

.my-packages.is-mobile .my-packages__title {
  font-size: 18px;
}
</style>
