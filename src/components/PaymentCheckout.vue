<template>
  <el-dialog
    :model-value="visible"
    title="确认订阅"
    :width="dialogWidth"
    align-center
    :close-on-click-modal="!paying"
    :close-on-press-escape="!paying"
    destroy-on-close
    class="payment-checkout-dialog"
    @close="handleClose"
  >
    <div v-if="pkg" class="checkout">
      <div class="checkout__summary">
        <div class="checkout__name">{{ pkg.displayName || pkg.name }}</div>
        <div class="checkout__price">
          <span class="checkout__amount">¥{{ formatPrice(payableAmount) }}</span>
          <span v-if="priceUnit" class="checkout__unit">{{ priceUnit }}</span>
        </div>
        <div v-if="discountInfo.hasDiscount" class="checkout__discount">
          <span class="checkout__original">¥{{ formatPrice(discountInfo.original) }}</span>
          <span class="checkout__discount-tag">{{ formatDiscountLabel(discountInfo.discount) }}</span>
          <span class="checkout__saved">省¥{{ formatPrice(discountInfo.saved) }}</span>
        </div>
        <p v-if="orderType === 'renewal'" class="checkout__hint">续费 / 复购订单</p>
      </div>

      <div v-if="step === 'method'" class="checkout__methods">
        <p class="checkout__label">支付方式</p>
        <div class="checkout__method is-active is-static">
          <span class="checkout__method-name">支付宝</span>
          <span class="checkout__method-desc">{{
            isMobile ? '跳转支付宝完成支付' : '扫码 / 跳转支付'
          }}</span>
        </div>
      </div>

      <div v-else-if="step === 'paying'" class="checkout__paying">
        <!-- 移动端：优先跳转，不展示二维码 -->
        <template v-if="isMobile && jumpPayUrl">
          <p class="checkout__label">正在跳转支付宝…</p>
          <a class="checkout__link" :href="jumpPayUrl" rel="noopener noreferrer">
            若未自动跳转，点击这里继续支付
          </a>
        </template>
        <template v-else-if="!isMobile && qrImageSrc">
          <p class="checkout__label">请使用支付宝扫码支付</p>
          <img class="checkout__qr" :src="qrImageSrc" alt="支付二维码" />
        </template>
        <template v-else-if="jumpPayUrl">
          <p class="checkout__label">已打开支付宝支付页面，请完成支付</p>
          <a class="checkout__link" :href="jumpPayUrl" target="_blank" rel="noopener noreferrer">
            若未自动跳转，点击这里继续支付
          </a>
        </template>
        <p class="checkout__wait">支付完成后将自动开通权益…</p>
        <p v-if="orderNo" class="checkout__order">订单号 {{ orderNo }}</p>
      </div>

      <div v-else-if="step === 'success'" class="checkout__result is-success">
        <p class="checkout__result-title">支付成功</p>
        <p class="checkout__result-desc">套餐权益已开通，可在控制台查看。</p>
      </div>

      <div v-else-if="step === 'error'" class="checkout__result is-error">
        <p class="checkout__result-title">支付未完成</p>
        <p class="checkout__result-desc">{{ errorMessage || '请稍后重试或前往订单页查看状态' }}</p>
      </div>
    </div>

    <template #footer>
      <div class="checkout__footer">
        <el-button v-if="step === 'method'" @click="handleClose">取消</el-button>
        <el-button
          v-if="step === 'method'"
          type="primary"
          :loading="paying"
          class="checkout__pay-btn"
          @click="startPay"
        >
          立即支付
        </el-button>
        <el-button v-if="step === 'paying'" :loading="checking" @click="checkOnce">
          我已完成支付
        </el-button>
        <el-button v-if="step === 'paying'" @click="handleClose">稍后支付</el-button>
        <el-button v-if="step === 'success'" type="primary" class="checkout__pay-btn" @click="goDashboard">
          进入控制台
        </el-button>
        <el-button v-if="step === 'error'" type="primary" class="checkout__pay-btn" @click="resetToMethod">
          重试
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createOrder, cancelOrder } from '@/api/order'
import { createPayment, queryPaymentStatus } from '@/api/payment'
import { useDevice } from '@/utils/device'
import { getPackagePayableAmount, getPackageDiscountInfo, formatPackagePrice, formatDiscountLabel } from '@/utils/packagePrice'

const PENDING_KEY = 'huihuo_pending_payment'

const props = defineProps({
  visible: { type: Boolean, default: false },
  pkg: { type: Object, default: null },
  /** purchase | renewal */
  orderType: { type: String, default: 'purchase' },
  priceUnit: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'success', 'close'])

const router = useRouter()
const { isMobile } = useDevice()
const dialogWidth = computed(() => (isMobile.value ? '100%' : '440px'))
/** 当前仅支持支付宝 */
const PAYMENT_METHOD = 'alipay'

const step = ref('method')
const paying = ref(false)
const checking = ref(false)
const errorMessage = ref('')
const orderId = ref('')
const orderNo = ref('')
const paymentId = ref('')
const qrCodeUrl = ref('')
const payUrl = ref('')
let pollTimer = null

const qrImageSrc = computed(() => {
  const url = qrCodeUrl.value || ''
  // 仅把明确是图片的地址当二维码；支付宝跳转链不当图片展示
  if (url.startsWith('data:image')) return url
  if (/^https?:\/\//i.test(url) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return url
  if (/^https?:\/\/[^/]*zpayz\.cn\/qrcode\//i.test(url)) return url
  return ''
})

/** 可跳转的支付链接（移动端优先） */
const jumpPayUrl = computed(() => {
  const url = payUrl.value || ''
  if (/^https?:\/\//i.test(url) || /^alipays?:\/\//i.test(url)) return url
  // 有时渠道把跳转链放在 qrcode 字段
  const fallback = qrCodeUrl.value || ''
  if (
    (/^https?:\/\//i.test(fallback) || /^alipays?:\/\//i.test(fallback)) &&
    !qrImageSrc.value
  ) {
    return fallback
  }
  return ''
})

const openPayJump = (url) => {
  if (!url) return
  if (isMobile.value) {
    // 移动端同页跳转，更易唤起支付宝；返回页靠 returnUrl / 轮询兜底
    window.location.href = url
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

const payableAmount = computed(() => getPackagePayableAmount(props.pkg || {}))
const discountInfo = computed(() => getPackageDiscountInfo(props.pkg || {}))

const formatPrice = (value) => formatPackagePrice(value)

const returnUrl = () => `${window.location.origin}/payment/return`

const persistPending = () => {
  sessionStorage.setItem(
    PENDING_KEY,
    JSON.stringify({
      orderId: orderId.value,
      paymentId: paymentId.value,
      orderNo: orderNo.value,
      packageName: props.pkg?.displayName || props.pkg?.name || '',
      at: Date.now()
    })
  )
}

const clearPending = () => {
  sessionStorage.removeItem(PENDING_KEY)
}

const stopPoll = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const resetState = () => {
  stopPoll()
  step.value = 'method'
  paying.value = false
  checking.value = false
  errorMessage.value = ''
  orderId.value = ''
  orderNo.value = ''
  paymentId.value = ''
  qrCodeUrl.value = ''
  payUrl.value = ''
}

watch(
  () => props.visible,
  (v) => {
    if (v) resetState()
    else stopPoll()
  }
)

const handleClose = () => {
  stopPoll()
  emit('update:visible', false)
  emit('close')
}

const resetToMethod = () => {
  stopPoll()
  step.value = 'method'
  paying.value = false
  errorMessage.value = ''
  qrCodeUrl.value = ''
  payUrl.value = ''
}

const goDashboard = () => {
  handleClose()
  router.push('/dashboard/plans')
}

const isPaidStatus = (status) => ['success', 'paid', 'completed'].includes(String(status || '').toLowerCase())

const applyPaid = () => {
  stopPoll()
  clearPending()
  step.value = 'success'
  ElMessage.success('支付成功，权益已开通')
  emit('success')
}

const checkOnce = async () => {
  if (!paymentId.value || checking.value) return
  checking.value = true
  try {
    const res = await queryPaymentStatus(paymentId.value)
    const payment = res?.data
    if (payment && (isPaidStatus(payment.status) || isPaidStatus(payment.order?.status))) {
      applyPaid()
    } else {
      ElMessage.info('尚未检测到支付结果，请稍后再试')
    }
  } catch (e) {
    console.error(e)
  } finally {
    checking.value = false
  }
}

const startPoll = () => {
  stopPoll()
  pollTimer = setInterval(async () => {
    if (!paymentId.value) return
    try {
      const res = await queryPaymentStatus(paymentId.value)
      const payment = res?.data
      if (payment && (isPaidStatus(payment.status) || isPaidStatus(payment.order?.status))) {
        applyPaid()
      }
    } catch {
      // 轮询失败不打断
    }
  }, 3000)
}

const startPay = async () => {
  if (!props.pkg?.id || paying.value) return
  paying.value = true
  errorMessage.value = ''

  try {
    const orderRes = await createOrder({
      packageId: props.pkg.id,
      type: props.orderType === 'renewal' ? 'renewal' : 'purchase'
    })
    const order = orderRes?.data
    if (!order?.id) throw new Error(orderRes?.message || '创建订单失败')

    orderId.value = order.id
    orderNo.value = order.orderNo || ''

    const payRes = await createPayment(order.id, {
      paymentMethod: PAYMENT_METHOD,
      returnUrl: returnUrl(),
      device: isMobile.value ? 'mobile' : 'pc'
    })
    const payment = payRes?.data
    if (!payment?.id) throw new Error(payRes?.message || '发起支付失败')

    paymentId.value = payment.id
    qrCodeUrl.value = payment.qrCodeUrl || ''
    payUrl.value = payment.payUrl || ''
    persistPending()
    step.value = 'paying'

    const jump = payUrl.value || (!qrImageSrc.value ? qrCodeUrl.value : '') || ''
    if (isMobile.value) {
      if (jump) openPayJump(jump)
    } else if (jump && !qrImageSrc.value) {
      openPayJump(jump)
    }

    startPoll()
  } catch (e) {
    // 对外统一文案，不透出后端/渠道原始错误
    errorMessage.value = '支付发起失败，请稍后重试'
    step.value = 'error'

    // 下单成功但支付失败时，尝试取消脏订单，避免卡住 pending payment
    if (orderId.value) {
      try {
        await cancelOrder(orderId.value)
      } catch {
        /* ignore */
      }
    }
  } finally {
    paying.value = false
  }
}

onUnmounted(stopPoll)

defineExpose({ PENDING_KEY })
</script>

<style scoped>
.checkout__summary {
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.checkout__name {
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.checkout__price {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.checkout__discount {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.checkout__original {
  font-size: 13px;
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.checkout__discount-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(236, 72, 153, 0.12);
  color: #db2777;
  font-size: 11px;
  font-weight: 700;
}

.checkout__saved {
  font-size: 12px;
  font-weight: 600;
  color: #db2777;
}

.checkout__amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
}

.checkout__unit {
  font-size: 13px;
  color: var(--text-secondary);
}

.checkout__hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.checkout__label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.checkout__methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkout__method {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color-strong);
  background: var(--bg-secondary);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
}

.checkout__method.is-static {
  cursor: default;
}

.checkout__method.is-active {
  border-color: var(--text-primary);
  background: var(--bg-tertiary);
}

.checkout__method-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.checkout__method-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}

.checkout__paying {
  text-align: center;
}

.checkout__qr {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--border-color);
}

.checkout__link {
  display: inline-block;
  margin: 8px 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.checkout__wait {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.checkout__order {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.checkout__result {
  text-align: center;
  padding: 12px 0 4px;
}

.checkout__result-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.checkout__result-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.checkout__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.checkout__pay-btn {
  --el-button-bg-color: var(--text-primary);
  --el-button-border-color: var(--text-primary);
  --el-button-text-color: var(--bg-primary);
  --el-button-hover-bg-color: var(--text-secondary);
  --el-button-hover-border-color: var(--text-secondary);
  --el-button-hover-text-color: var(--bg-primary);
  --el-button-active-bg-color: var(--text-primary);
  --el-button-active-border-color: var(--text-primary);
  --el-button-active-text-color: var(--bg-primary);
}
</style>

<!-- el-dialog 挂到 body，需非 scoped 才能改外壳 / 移动端边距 -->
<style>
.payment-checkout-dialog.el-dialog {
  --el-dialog-bg-color: var(--bg-secondary);
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  max-width: 440px;
}

.payment-checkout-dialog .el-dialog__header {
  padding-bottom: 8px;
}

.payment-checkout-dialog .el-dialog__title {
  color: var(--text-primary);
  font-weight: 700;
}

.payment-checkout-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-secondary);
}

.payment-checkout-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: var(--text-primary);
}

.payment-checkout-dialog .el-dialog__body {
  color: var(--text-primary);
  padding-top: 8px;
}

.payment-checkout-dialog .el-dialog__footer {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.payment-checkout-dialog .el-button--default {
  --el-button-bg-color: var(--bg-tertiary);
  --el-button-border-color: var(--border-color-strong);
  --el-button-text-color: var(--text-primary);
  --el-button-hover-bg-color: var(--bg-hover);
  --el-button-hover-border-color: var(--border-color-strong);
  --el-button-hover-text-color: var(--text-primary);
}

@media (max-width: 960px) {
  /* 左右留白 + 垂直居中；高度随内容自适应 */
  .el-overlay-dialog:has(.payment-checkout-dialog) {
    display: flex !important;
    align-items: center;
    justify-content: center;
    padding: 16px 20px;
    box-sizing: border-box;
  }

  .payment-checkout-dialog.el-dialog {
    width: 100% !important;
    max-width: 100% !important;
    height: fit-content !important;
    max-height: calc(100vh - 32px) !important;
    margin: 0 !important;
    align-self: center;
    overflow: auto;
  }

  .payment-checkout-dialog .el-dialog__body {
    flex: none !important;
  }
}
</style>
