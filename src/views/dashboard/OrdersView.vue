<template>
  <div class="orders-view" :class="{ 'is-mobile': isMobile }">
    <div class="orders-header">
      <div class="orders-header-left">
        <h2 class="orders-title">购买记录</h2>
        <p v-if="!isMobile" class="orders-desc">查看套餐订阅与支付订单</p>
      </div>

      <el-select
        v-if="!isMobile"
        v-model="statusFilter"
        placeholder="全部状态"
        clearable
        class="status-filter"
        @change="onStatusChange"
      >
        <el-option label="待支付" value="pending" />
        <el-option label="已支付" value="paid" />
        <el-option label="已取消" value="cancelled" />
        <el-option label="已退款" value="refunded" />
        <el-option label="已过期" value="expired" />
      </el-select>

      <button
        v-else
        type="button"
        class="mobile-filter-chip"
        @click="showStatusPicker = true"
      >
        <span>{{ statusFilterLabel }}</span>
        <van-icon name="arrow-down" size="12" />
      </button>
    </div>

    <van-popup v-model:show="showStatusPicker" position="bottom" round>
      <van-picker
        title="选择状态"
        :columns="statusPickerColumns"
        :model-value="statusPickerValue"
        @cancel="showStatusPicker = false"
        @confirm="onStatusPickerConfirm"
      />
    </van-popup>

    <div class="orders-list" v-loading="loading">
      <template v-if="isMobile">
        <van-empty v-if="!loading && orders.length === 0" description="暂无订单记录" />
        <van-cell-group v-else-if="orders.length" inset>
          <van-cell
            v-for="order in orders"
            :key="order.id"
            :title="order.package?.displayName || order.package?.name || order.description || '套餐订单'"
            :label="`${order.orderNo} · ${formatDateTime(order.createdAt)}`"
            :value="`¥${formatAmount(order.finalAmount ?? order.amount)}`"
          >
            <template #right-icon>
              <van-tag :type="statusTagType(order.status)" plain round>
                {{ statusLabel(order.status) }}
              </van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </template>

      <template v-else>
        <div v-if="!loading && orders.length === 0" class="orders-empty">
          暂无订单记录
        </div>
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-left">
            <div class="order-icon">
              <el-icon :size="22"><Clock /></el-icon>
            </div>
            <div class="order-info">
              <h4 class="order-title">
                {{ order.package?.displayName || order.package?.name || order.description || '套餐订单' }}
              </h4>
              <p class="order-meta">{{ order.orderNo }} · {{ formatDateTime(order.createdAt) }}</p>
            </div>
          </div>
          <div class="order-right">
            <div class="order-amount-wrapper">
              <p class="order-amount">¥{{ formatAmount(order.finalAmount ?? order.amount) }}</p>
              <p :class="['order-status', statusClass(order.status)]">
                {{ statusLabel(order.status) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="pagination-wrapper" v-if="pagination.total > pagination.pageSize">
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
import { ref, computed, onMounted } from 'vue'
import { Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMyOrders } from '@/api/order'
import { useDevice } from '@/utils/device'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'

const { isMobile } = useDevice()
const { runPageBoot } = useDashboardPageBoot()
const orders = ref([])
const loading = ref(false)
const statusFilter = ref('')
const showStatusPicker = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待支付', value: 'pending' },
  { text: '已支付', value: 'paid' },
  { text: '已取消', value: 'cancelled' },
  { text: '已退款', value: 'refunded' },
  { text: '已过期', value: 'expired' }
]

const statusPickerColumns = statusOptions.map((o) => ({ text: o.text, value: o.value }))
const statusPickerValue = computed(() => [statusFilter.value || ''])
const statusFilterLabel = computed(() => {
  const hit = statusOptions.find((o) => o.value === (statusFilter.value || ''))
  return hit?.text || '全部状态'
})

const onStatusPickerConfirm = ({ selectedValues, selectedOptions }) => {
  statusFilter.value = selectedValues?.[0] ?? selectedOptions?.[0]?.value ?? ''
  showStatusPicker.value = false
  onStatusChange()
}

const STATUS_MAP = {
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
  expired: '已过期'
}

const statusLabel = (status) => STATUS_MAP[status] || status || '-'
const statusClass = (status) => {
  if (status === 'paid') return 'is-paid'
  if (status === 'refunded' || status === 'cancelled' || status === 'expired') return 'is-muted'
  if (status === 'pending') return 'is-pending'
  return ''
}
const statusTagType = (status) => {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'refunded' || status === 'cancelled') return 'danger'
  return 'primary'
}

const formatAmount = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return value ?? '--'
  return n.toFixed(2)
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    if (statusFilter.value) params.status = statusFilter.value

    const response = await getMyOrders(params)
    if (response.success) {
      orders.value = Array.isArray(response.data) ? response.data : []
      if (response.pagination) {
        pagination.value.total = response.pagination.total || orders.value.length
      } else {
        pagination.value.total = orders.value.length
      }
    } else {
      orders.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败，请稍后重试')
    orders.value = []
  } finally {
    loading.value = false
  }
}

const onStatusChange = () => {
  pagination.value.page = 1
  loadOrders()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadOrders()
}

onMounted(() => {
  runPageBoot(() => loadOrders())
})
</script>

<style scoped>
.orders-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 8px;
  color: var(--text-primary);
}

.orders-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.orders-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
}

.orders-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.status-filter {
  width: 140px;
  flex-shrink: 0;
}

.mobile-filter-chip {
  flex-shrink: 0;
  width: auto;
  min-width: 96px;
  max-width: 42%;
  height: 36px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.mobile-filter-chip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.orders-empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-tertiary);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
}

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 20px 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.order-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.order-title {
  font-weight: 700;
  font-size: 16px;
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-meta {
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0;
  font-family: 'Inter', sans-serif;
  word-break: break-all;
}

.order-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.order-amount-wrapper {
  text-align: right;
}

.order-amount {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 4px 0;
  font-family: 'Space Grotesk', sans-serif;
}

.order-status {
  font-size: 11px;
  font-weight: 700;
  margin: 0;
  color: var(--text-secondary);
}

.order-status.is-paid {
  color: #22c55e;
}

.order-status.is-pending {
  color: #f59e0b;
}

.order-status.is-muted {
  color: var(--text-tertiary);
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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

@media (max-width: 960px) {
  .orders-view.is-mobile {
    padding-top: 0;
  }

  .orders-view.is-mobile .orders-header {
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .orders-header-left {
    min-width: 0;
    flex: 1;
  }

  .orders-title {
    font-size: 22px;
    line-height: 1.25;
  }

  .orders-list :deep(.van-cell-group--inset) {
    margin: 0;
  }

  .pagination-wrapper {
    margin-top: 12px;
  }
}
</style>
