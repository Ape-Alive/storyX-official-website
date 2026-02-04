<template>
  <div class="orders-view">
    <div class="orders-header">
      <h2 class="orders-title">财务记录</h2>
      <button class="filter-btn">
        筛选查询
        <el-icon :size="14"><ArrowDown /></el-icon>
      </button>
    </div>

    <div class="orders-list">
      <div
        v-for="(order, i) in orders"
        :key="i"
        class="order-card"
      >
        <div class="order-left">
          <div class="order-icon">
            <el-icon :size="24"><Clock /></el-icon>
          </div>
          <div class="order-info">
            <h4 class="order-title">{{ order.title }}</h4>
            <p class="order-meta">{{ order.id }} • {{ order.date }}</p>
          </div>
        </div>
        <div class="order-right">
          <div class="order-amount-wrapper">
            <p class="order-amount">¥{{ order.amount }}</p>
            <p :class="['order-status', { refunded: order.status === '已退款' }]">
              {{ order.status }}
            </p>
          </div>
          <el-icon :size="20" class="order-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Clock, ArrowRight, ArrowDown } from '@element-plus/icons-vue'

const orders = ref([
  { id: 'ORD-20240501-112', title: '创作者版月度订阅', date: '2024-05-01', amount: '299.00', status: '已完成' },
  { id: 'ORD-20240401-098', title: '创作者版首次购买', date: '2024-04-01', amount: '299.00', status: '已完成' },
  { id: 'ORD-20240320-044', title: '临时额外额度充值', date: '2024-03-20', amount: '9.90', status: '已退款' }
])
</script>

<style scoped>
.orders-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 24px;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.orders-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  transition: color 0.3s ease;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 10px;
  font-weight: 900;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.filter-btn:hover {
  background: var(--bg-hover);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 32px;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-card:hover {
  border-color: rgba(147, 51, 234, 0.2);
  box-shadow: 0 8px 30px rgba(147, 51, 234, 0.1);
}

.order-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.order-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  transition: all 0.3s;
}

.order-card:hover .order-icon {
  background: rgba(147, 51, 234, 0.1);
  color: var(--accent-color);
  transition: color 0.3s ease;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-title {
  font-weight: 700;
  font-size: 18px;
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
}

.order-meta {
  font-size: 10px;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.order-right {
  display: flex;
  align-items: center;
  gap: 40px;
}

.order-amount-wrapper {
  text-align: right;
}

.order-amount {
  font-size: 20px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.02em;
  margin: 0 0 4px 0;
  font-family: 'Space Grotesk', sans-serif;
}

.order-status {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #22c55e;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.order-status.refunded {
  color: var(--text-tertiary);
  transition: color 0.3s ease;
}

.order-arrow {
  color: var(--text-disabled);
  transition: color 0.3s ease;
  transition: all 0.3s;
}

.order-card:hover .order-arrow {
  color: var(--accent-color);
  transition: color 0.3s ease;
}
</style>
