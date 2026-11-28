<template>
  <div class="account-page" :class="{ 'is-mobile': isMobile }">
    <header class="page-head">
      <div class="page-head__icon" aria-hidden="true">
        <el-icon :size="22"><User /></el-icon>
      </div>
      <div>
        <h1 class="page-head__title">个人中心</h1>
        <p class="page-head__desc">管理您的账户信息、套餐权益与联系支持</p>
      </div>
    </header>

    <!-- 顶部资料卡 -->
    <section id="profile" class="profile-banner card">
      <div class="profile-banner__left">
        <div class="profile-banner__avatar">{{ userInitials }}</div>
        <div class="profile-banner__meta">
          <div class="profile-banner__name-row">
            <span class="profile-banner__name">{{ displayName }}</span>
            <span v-if="hasActivePackage" class="vip-badge">VIP</span>
          </div>
          <div class="profile-banner__email">{{ displayEmail }}</div>
          <div v-if="userId" class="profile-banner__id">
            <span>ID: {{ userIdRevealed ? userId : maskedUserId }}</span>
            <button type="button" class="btn-ghost btn-ghost--sm" @click="copyUserId">复制</button>
          </div>
        </div>
      </div>
      <button type="button" class="btn-outline" @click="scrollTo('info')">
        <el-icon :size="16"><EditPen /></el-icon>
        编辑资料
      </button>
    </section>

    <div class="account-grid">
      <!-- 左栏 -->
      <div class="account-col account-col--side">
        <section id="info" class="card info-card">
          <div class="card-head">
            <div class="card-head__title">
              <el-icon :size="18"><UserFilled /></el-icon>
              <span>我的信息</span>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-item__label">用户名</div>
              <div class="info-item__value">{{ displayName }}</div>
            </div>
            <div class="info-item">
              <div class="info-item__label">邮箱地址</div>
              <div class="info-item__value">{{ displayEmail }}</div>
            </div>
            <div class="info-item info-item--full">
              <div class="info-item__label">用户 ID</div>
              <div class="info-item__value mono">{{ userId || '—' }}</div>
            </div>
          </div>
          <button type="button" class="card-link" @click="scrollTo('profile')">查看资料</button>
        </section>

        <section id="invite" class="card invite-card">
          <div class="card-head">
            <div class="card-head__title">
              <el-icon :size="18"><Present /></el-icon>
              <span>客户端邀请</span>
            </div>
            <button type="button" class="btn-ghost btn-ghost--sm" :disabled="inviteLoading" @click="loadInvite">
              刷新
            </button>
          </div>

          <div v-if="inviteLoading" class="card-loading">加载中…</div>
          <div v-else-if="inviteError" class="alert alert--warn">{{ inviteError }}</div>
          <template v-else-if="invite">
            <div
              v-if="!invite.isDistributor"
              class="alert alert--warn"
            >
              {{ invite.distributorStatusLabel || '分销未开通或已停用' }}
            </div>
            <div class="invite-code-block">
              <div class="invite-code-block__label">我的邀请码</div>
              <div class="invite-code-block__row">
                <span class="invite-code">{{ invite.inviteCode || '—' }}</span>
                <button
                  type="button"
                  class="btn-ghost btn-ghost--sm"
                  :disabled="!invite.inviteCode"
                  @click="copyInviteCode"
                >
                  复制
                </button>
              </div>
            </div>
            <div class="invite-stats">
              <div>
                <div class="invite-stats__num">{{ invite.stats?.inviteeCount ?? 0 }}</div>
                <div class="invite-stats__label">已邀请</div>
              </div>
              <div>
                <div class="invite-stats__num">{{ invite.stats?.rewardCount ?? 0 }}</div>
                <div class="invite-stats__label">奖励次数</div>
              </div>
              <div>
                <div class="invite-stats__num">{{ formatQuota(invite.stats?.rewardQuotaTotal) }}</div>
                <div class="invite-stats__label">累计积分</div>
              </div>
            </div>
            <div class="invite-level">
              {{ invite.distributorLevel?.name || '未设置等级' }}
              <span v-if="invite.distributorStatusLabel"> · {{ invite.distributorStatusLabel }}</span>
            </div>
          </template>
        </section>

        <section id="orders" class="card orders-card">
          <div class="card-head">
            <div class="card-head__title">
              <el-icon :size="18"><Tickets /></el-icon>
              <span>财务订单</span>
            </div>
          </div>

          <div v-if="ordersLoading" class="card-loading">加载中…</div>
          <div v-else-if="previewOrders.length === 0" class="card-empty">暂无订单记录</div>
          <div v-else class="order-list">
            <div v-for="order in previewOrders" :key="order.id" class="order-row">
              <div class="order-row__icon">
                <el-icon :size="18"><Clock /></el-icon>
              </div>
              <div class="order-row__main">
                <div class="order-row__title">{{ order.title }}</div>
                <div class="order-row__meta">{{ order.meta }}</div>
              </div>
              <div class="order-row__right">
                <div class="order-row__amount">¥{{ order.amount }}</div>
                <span :class="['status-pill', `is-${order.status}`]">{{ order.statusLabel }}</span>
              </div>
            </div>
          </div>
          <button
            v-if="ordersTotal > previewOrders.length || showAllOrders"
            type="button"
            class="card-link"
            @click="toggleAllOrders"
          >
            {{ showAllOrders ? '收起订单' : '查看全部订单' }}
          </button>
        </section>
      </div>

      <!-- 右栏 -->
      <div class="account-col account-col--main">
        <section id="packages" class="card packages-card">
          <div class="card-head">
            <div class="card-head__title">
              <el-icon :size="18"><Box /></el-icon>
              <span>我的套餐</span>
            </div>
            <button type="button" class="btn-primary" @click="goPlans">去续费 / 购买</button>
          </div>

          <div v-if="packagesLoading" class="card-loading">加载中…</div>
          <div v-else-if="packages.length === 0" class="card-empty">
            暂无已购套餐
            <button type="button" class="card-link" @click="goPlans">去购买会员计划</button>
          </div>
          <div v-else class="pkg-list">
            <div v-for="pkg in packages" :key="pkg.id" class="pkg-row">
              <div class="pkg-row__icon">
                <el-icon :size="18"><Clock /></el-icon>
              </div>
              <div class="pkg-row__main">
                <div class="pkg-row__title-row">
                  <span class="pkg-row__name">{{ pkg.name }}</span>
                  <span :class="['status-pill', `is-${pkg.statusKey}`]">{{ pkg.statusLabel }}</span>
                </div>
                <div class="pkg-row__meta">{{ pkg.metaLine }}</div>
                <div v-if="pkg.unavailableReason" class="pkg-row__reason">{{ pkg.unavailableReason }}</div>
              </div>
              <div class="pkg-row__quota">
                <div class="pkg-row__quota-label">积分</div>
                <div class="pkg-row__quota-value">{{ pkg.quotaText }}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" class="card support-card">
          <div class="support-card__panel">
            <div class="support-card__icon">
              <el-icon :size="28"><Headset /></el-icon>
            </div>
            <h3 class="support-card__title">技术支持</h3>
            <p class="support-card__desc">
              如果您在制片过程中遇到技术难题或需要定制化的企业解决方案，请随时联系我们的专家团队。
            </p>
            <a class="support-card__email" href="mailto:vip@huihuo.ai">
              <el-icon :size="16"><Message /></el-icon>
              vip@huihuo.ai
            </a>
            <div class="support-card__sla">服务可用率 99.9% / SLA 已激活</div>
          </div>

          <form class="support-form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-field">
                <label>您的姓名</label>
                <input v-model="form.name" placeholder="姓名 / 昵称" />
              </div>
              <div class="form-field">
                <label>邮箱地址</label>
                <input v-model="form.email" type="email" placeholder="name@domain.com" />
              </div>
            </div>
            <div class="form-field">
              <label>手机号码</label>
              <input v-model="form.phone" type="tel" maxlength="11" placeholder="请输入手机号" />
            </div>
            <div class="form-field">
              <label>咨询详情</label>
              <textarea v-model="form.content" rows="4" placeholder="请详细描述您的需求或遇到的技术问题..." />
            </div>
            <button type="submit" class="btn-primary btn-primary--block" :disabled="submitting">
              {{ submitting ? '提交中…' : '提交咨询' }}
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { showSuccessToast, showFailToast } from 'vant'
import {
  User,
  UserFilled,
  EditPen,
  Present,
  Tickets,
  Clock,
  Box,
  Headset,
  Message,
} from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/storage'
import { useDevice } from '@/utils/device'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'
import { getMyPackages } from '@/api/pricing'
import { getMyOrders } from '@/api/order'
import { getMyInvite } from '@/api/invite'
import { submitFeedback } from '@/api/feedback'
import { formatQuota, isUnlimitedQuota } from '@/composables/useMyActivePackages'

const route = useRoute()
const router = useRouter()
const { isMobile } = useDevice()
const { runPageBoot } = useDashboardPageBoot()

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
const userIdRevealed = ref(false)

const packages = ref([])
const packagesLoading = ref(false)
const hasActivePackage = computed(() => packages.value.some((p) => p.statusKey === 'active'))

const orders = ref([])
const ordersLoading = ref(false)
const ordersTotal = ref(0)
const showAllOrders = ref(false)
const previewOrders = computed(() =>
  showAllOrders.value ? orders.value : orders.value.slice(0, 3),
)

const invite = ref(null)
const inviteLoading = ref(false)
const inviteError = ref('')

const submitting = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  content: '',
})

const STATUS_LABEL = {
  active: '使用中',
  expired: '已过期',
  no_quota: '积分用尽',
  inactive: '已禁用',
  not_started: '未开始',
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatAmount = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return value ?? '--'
  return n.toFixed(2)
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
  return {
    id: item.id,
    name: pkg.displayName || pkg.name || '未知套餐',
    statusKey,
    statusLabel: STATUS_LABEL[statusKey] || statusKey,
    unavailableReason: item.unavailableReason || '',
    quotaText: unlimited ? '无限积分' : `剩余 ${formatQuota(remaining)}`,
    metaLine: start ? `有效期 ${start} ~ ${end}` : `有效期至 ${end}`,
  }
}

const transformOrder = (order) => ({
  id: order.id,
  title: order.package?.displayName || order.package?.name || order.description || '套餐订单',
  meta: `${order.orderNo || ''} · ${formatDateTime(order.createdAt)}`.replace(/^ · /, ''),
  amount: formatAmount(order.finalAmount ?? order.amount),
  status: order.status || '',
  statusLabel: STATUS_LABEL[order.status] || order.status || '-',
})

const loadPackages = async () => {
  packagesLoading.value = true
  try {
    const response = await getMyPackages({ activeOnly: false, page: 1, pageSize: 50 })
    packages.value =
      response.success && Array.isArray(response.data)
        ? response.data.map(transformPackage)
        : []
  } catch (error) {
    console.error(error)
    packages.value = []
  } finally {
    packagesLoading.value = false
  }
}

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const response = await getMyOrders({ page: 1, pageSize: showAllOrders.value ? 50 : 10 })
    if (response.success) {
      const list = Array.isArray(response.data) ? response.data : []
      orders.value = list.map(transformOrder)
      ordersTotal.value = response.pagination?.total ?? list.length
    } else {
      orders.value = []
      ordersTotal.value = 0
    }
  } catch (error) {
    console.error(error)
    orders.value = []
  } finally {
    ordersLoading.value = false
  }
}

const loadInvite = async () => {
  inviteLoading.value = true
  inviteError.value = ''
  try {
    const response = await getMyInvite()
    if (response.success) {
      invite.value = response.data || null
    } else {
      invite.value = null
      inviteError.value = response.message || '加载邀请信息失败'
    }
  } catch (error) {
    invite.value = null
    inviteError.value = error?.message || '加载邀请信息失败'
  } finally {
    inviteLoading.value = false
  }
}

const toggleAllOrders = async () => {
  showAllOrders.value = !showAllOrders.value
  if (showAllOrders.value) await loadOrders()
}

const goPlans = () => router.push('/dashboard/plans')

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const notifySuccess = (msg) => {
  if (isMobile.value) showSuccessToast(msg)
  else ElMessage.success(msg)
}
const notifyFail = (msg) => {
  if (isMobile.value) showFailToast(msg)
  else ElMessage.warning(msg)
}

const copyText = async (text, okMsg) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    notifySuccess(okMsg)
  } catch {
    notifyFail('复制失败')
  }
}

const copyUserId = () => {
  userIdRevealed.value = true
  copyText(userId.value, '已复制用户 ID')
}
const copyInviteCode = () => copyText(invite.value?.inviteCode, '邀请码已复制')

const handleSubmit = async () => {
  if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.content.trim()) {
    notifyFail('请完整填写表单')
    return
  }
  if (!/.+@.+\..+/.test(form.email.trim())) {
    notifyFail('邮箱格式不正确')
    return
  }
  if (!/^1\d{10}$/.test(form.phone.trim())) {
    notifyFail('手机号格式不正确')
    return
  }
  submitting.value = true
  try {
    const response = await submitFeedback({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      content: form.content.trim(),
    })
    if (response.success) {
      notifySuccess('已提交，我们会尽快联系您')
      form.name = ''
      form.email = ''
      form.phone = ''
      form.content = ''
    } else {
      notifyFail(response.message || '提交失败')
    }
  } catch (error) {
    notifyFail(error?.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const scrollToHash = () => {
  const hash = (route.hash || '').replace(/^#/, '')
  if (!hash) return
  nextTick(() => scrollTo(hash))
}

onMounted(() => {
  const stored = getUserInfo() || {}
  if (stored.name) form.name = stored.name
  if (stored.email) form.email = stored.email

  runPageBoot(() =>
    Promise.allSettled([loadPackages(), loadOrders(), loadInvite()]),
  ).then(() => scrollToHash())
})

watch(() => route.hash, scrollToHash)
</script>

<style scoped>
.account-page {
  --ink: #1c1917;
  --muted: rgba(28, 25, 23, 0.55);
  --line: rgba(28, 25, 23, 0.1);
  --card: #fff;
  --soft: rgba(28, 25, 23, 0.04);
  --warn: #a16207;
  --warn-bg: rgba(161, 98, 7, 0.1);

  width: 100%;
  max-width: 1100px;
  color: var(--ink);
}

.page-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.page-head__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-head__title {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.page-head__desc {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04);
  scroll-margin-top: 88px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.card-head__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 750;
}

.card-loading,
.card-empty {
  padding: 20px 0;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

.card-link {
  display: block;
  margin: 12px 0 0 auto;
  border: none;
  background: transparent;
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.profile-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 22px 24px;
  background:
    radial-gradient(ellipse 80% 120% at 100% 0%, rgba(28, 25, 23, 0.08), transparent 55%),
    linear-gradient(135deg, #f4f3f1 0%, #ebeae7 100%);
  border-color: rgba(28, 25, 23, 0.08);
}

.profile-banner__left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.profile-banner__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-banner__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.profile-banner__name {
  font-size: 20px;
  font-weight: 800;
}

.vip-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.profile-banner__email,
.profile-banner__id {
  margin-top: 4px;
  font-size: 13px;
  color: var(--muted);
  word-break: break-all;
}

.profile-banner__id {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.account-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.4fr);
  gap: 16px;
  align-items: start;
}

.account-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.info-item--full {
  grid-column: 1 / -1;
}

.info-item__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 4px;
}

.info-item__value {
  font-size: 14px;
  font-weight: 650;
  word-break: break-all;
}

.info-item__value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.alert {
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.45;
  margin-bottom: 12px;
}

.alert--warn {
  background: var(--warn-bg);
  color: var(--warn);
}

.invite-code-block {
  padding: 12px;
  border-radius: 12px;
  background: var(--soft);
  margin-bottom: 12px;
}

.invite-code-block__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 6px;
}

.invite-code-block__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.invite-code {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-family: 'Space Grotesk', ui-monospace, monospace;
}

.invite-stats {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.invite-stats__num {
  font-size: 18px;
  font-weight: 800;
}

.invite-stats__label {
  margin-top: 2px;
  font-size: 11px;
  color: var(--muted);
}

.invite-level {
  font-size: 12px;
  color: var(--muted);
}

.order-list,
.pkg-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.order-row,
.pkg-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
}

.order-row:first-child,
.pkg-row:first-child {
  border-top: none;
  padding-top: 4px;
}

.order-row__icon,
.pkg-row__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(28, 25, 23, 0.7);
}

.order-row__main,
.pkg-row__main {
  flex: 1;
  min-width: 0;
}

.order-row__title,
.pkg-row__name {
  font-size: 14px;
  font-weight: 750;
}

.order-row__meta,
.pkg-row__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.pkg-row__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.pkg-row__reason {
  margin-top: 4px;
  font-size: 12px;
  color: var(--warn);
}

.order-row__right,
.pkg-row__quota {
  text-align: right;
  flex-shrink: 0;
}

.order-row__amount,
.pkg-row__quota-value {
  font-size: 15px;
  font-weight: 800;
}

.pkg-row__quota-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 650;
}

.status-pill {
  display: inline-flex;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(28, 25, 23, 0.06);
  color: rgba(28, 25, 23, 0.6);
}

.status-pill.is-active,
.status-pill.is-paid {
  background: rgba(17, 17, 17, 0.1);
  color: #111;
}

.status-pill.is-pending {
  background: var(--warn-bg);
  color: var(--warn);
}

.status-pill.is-expired,
.status-pill.is-inactive,
.status-pill.is-cancelled,
.status-pill.is-refunded {
  color: rgba(28, 25, 23, 0.4);
}

.status-pill.is-no_quota {
  background: var(--warn-bg);
  color: var(--warn);
}

.support-card {
  display: grid;
  grid-template-columns: minmax(200px, 0.85fr) minmax(0, 1.15fr);
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.support-card__panel {
  padding: 22px 20px;
  background: #111;
  color: rgba(255, 255, 255, 0.88);
}

.support-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.support-card__title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.support-card__desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.7);
}

.support-card__email {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.support-card__email:hover {
  text-decoration: underline;
}

.support-card__sla {
  margin-top: 14px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.support-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

.form-field input,
.form-field textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--ink);
  background: #fff;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #111;
}

.form-field textarea {
  resize: vertical;
  min-height: 96px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border: none;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  background: #000;
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-primary--block {
  width: 100%;
  border-radius: 10px;
  min-height: 42px;
  margin-top: 4px;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.85);
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-outline:hover {
  background: #fff;
}

.btn-ghost {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--soft);
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  padding: 6px 10px;
}

.btn-ghost--sm {
  padding: 3px 8px;
  font-size: 11px;
}

.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .account-grid {
    grid-template-columns: 1fr;
  }

  .support-card {
    grid-template-columns: 1fr;
  }

  .profile-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-head__title {
    font-size: 22px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .card {
    scroll-margin-top: 72px;
  }
}

.account-page.is-mobile .profile-banner__avatar {
  width: 60px;
  height: 60px;
  font-size: 17px;
}

.account-page.is-mobile .pkg-row {
  flex-wrap: wrap;
}

.account-page.is-mobile .pkg-row__quota {
  width: 100%;
  text-align: left;
  padding-left: 48px;
}
</style>
