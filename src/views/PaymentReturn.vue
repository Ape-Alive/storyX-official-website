<template>
  <div class="payment-return">
    <div class="payment-return__card">
      <h1 class="payment-return__title">{{ title }}</h1>
      <p class="payment-return__desc">{{ description }}</p>
      <div class="payment-return__actions">
        <button type="button" class="payment-return__btn is-primary" @click="goPlans">
          查看套餐
        </button>
        <button type="button" class="payment-return__btn" @click="goOrders">
          我的订单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getToken } from '@/utils/storage'
import { queryPaymentStatus } from '@/api/payment'
import { getOrderDetail } from '@/api/order'

const PENDING_KEY = 'huihuo_pending_payment'

const router = useRouter()
const title = ref('正在确认支付结果…')
const description = ref('请稍候，我们正在同步支付状态。')
let timer = null

const isPaidStatus = (status) =>
  ['success', 'paid', 'completed'].includes(String(status || '').toLowerCase())

const goPlans = () => router.push('/dashboard/plans')
const goOrders = () => router.push('/dashboard/orders')

const finishSuccess = (packageName) => {
  title.value = '支付成功'
  description.value = packageName
    ? `「${packageName}」已开通，可在控制台使用。`
    : '套餐权益已开通，可在控制台使用。'
  sessionStorage.removeItem(PENDING_KEY)
}

const finishPending = () => {
  title.value = '支付结果确认中'
  description.value =
    '若您已完成付款，权益将在回调到达后自动开通，也可稍后在「财务订单」中查看。'
}

onMounted(async () => {
  if (!getToken()) {
    router.replace({ path: '/auth/login', query: { redirect: '/payment/return' } })
    return
  }

  let pending = null
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null')
  } catch {
    pending = null
  }

  if (!pending?.paymentId && !pending?.orderId) {
    finishPending()
    return
  }

  const check = async () => {
    try {
      if (pending.paymentId) {
        const res = await queryPaymentStatus(pending.paymentId)
        const payment = res?.data
        if (payment && (isPaidStatus(payment.status) || isPaidStatus(payment.order?.status))) {
          finishSuccess(pending.packageName)
          return true
        }
      } else if (pending.orderId) {
        const res = await getOrderDetail(pending.orderId)
        if (isPaidStatus(res?.data?.status)) {
          finishSuccess(pending.packageName)
          return true
        }
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  if (await check()) return

  let tries = 0
  timer = setInterval(async () => {
    tries += 1
    if (await check() || tries >= 10) {
      clearInterval(timer)
      timer = null
      if (tries >= 10) finishPending()
    }
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.payment-return {
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px 48px;
  background: #f3eee6;
}

.payment-return__card {
  width: 100%;
  max-width: 480px;
  padding: 40px 36px;
  border-radius: 20px;
  background: #faf7f2;
  box-shadow: 0 12px 40px rgba(28, 25, 23, 0.08);
  text-align: center;
}

.payment-return__title {
  margin: 0;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #1c1917;
}

.payment-return__desc {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(28, 25, 23, 0.6);
}

.payment-return__actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.payment-return__btn {
  border: 1px solid rgba(28, 25, 23, 0.15);
  border-radius: 999px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  color: #1c1917;
  cursor: pointer;
}

.payment-return__btn.is-primary {
  border-color: #1c1917;
  background: #1c1917;
  color: #faf7f2;
}
</style>
