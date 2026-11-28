<template>
  <div class="account-view" :class="{ 'is-mobile': isMobile }">
    <!-- PC：左侧二级导航常驻 -->
    <aside v-if="!isMobile" class="account-subnav" aria-label="账户中心">
      <h2 class="account-subnav__title">我的</h2>
      <nav class="account-subnav__list">
        <router-link
          v-for="item in accountNavItems"
          :key="item.id"
          :to="item.path"
          :class="['account-subnav__item', { active: isAccountNavActive(route.path, item.path) }]"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </aside>

    <!-- 移动：枢纽列表 -->
    <div v-if="isMobile && isHub" class="account-hub">
      <header class="account-hub__header">
        <div class="account-hub__avatar">{{ userInitials }}</div>
        <div class="account-hub__meta">
          <div class="account-hub__name">{{ displayName }}</div>
          <div class="account-hub__email">{{ displayEmail }}</div>
        </div>
      </header>

      <van-cell-group inset class="account-hub__group">
        <van-cell
          v-for="item in accountNavItems"
          :key="item.id"
          :title="item.label"
          :icon="item.vantIcon"
          is-link
          :to="item.path"
        />
      </van-cell-group>
    </div>

    <!-- 内容区：PC 始终；移动为子页 -->
    <div v-if="!isMobile || !isHub" class="account-content">
      <button
        v-if="isMobile"
        type="button"
        class="account-back"
        @click="goHub"
      >
        <van-icon name="arrow-left" />
        <span>返回</span>
      </button>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDevice } from '@/utils/device'
import { getUserInfo } from '@/utils/storage'
import { accountNavItems, isAccountNavActive } from '@/config/accountNav'

const route = useRoute()
const router = useRouter()
const { isMobile } = useDevice()

const isHub = computed(() => route.path === '/dashboard/account' || route.path === '/dashboard/account/')

const user = computed(() => getUserInfo() || {})
const displayEmail = computed(() => user.value.email || '未登录邮箱')
const displayName = computed(() => {
  if (user.value.name) return user.value.name
  const email = user.value.email || ''
  return email.split('@')[0] || '用户'
})
const userInitials = computed(() => {
  const email = user.value.email || ''
  const part = email.split('@')[0] || 'U'
  return part.substring(0, 2).toUpperCase()
})

const goHub = () => {
  router.push('/dashboard/account')
}
</script>

<style scoped>
.account-view {
  display: flex;
  gap: 20px;
  width: 100%;
  min-height: 420px;
  color: #1c1917;
}

.account-view.is-mobile {
  flex-direction: column;
  gap: 0;
  min-height: 0;
}

.account-subnav {
  width: 200px;
  flex-shrink: 0;
  padding: 8px 0;
}

.account-subnav__title {
  margin: 0 0 16px;
  padding: 0 12px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.account-subnav__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-subnav__item {
  display: block;
  padding: 11px 14px;
  border-radius: 10px;
  color: rgba(28, 25, 23, 0.62);
  text-decoration: none;
  font-size: 14px;
  font-weight: 650;
  transition: background 0.15s, color 0.15s;
}

.account-subnav__item:hover {
  background: rgba(28, 25, 23, 0.05);
  color: #1c1917;
}

.account-subnav__item.active {
  background: rgba(28, 25, 23, 0.08);
  color: #111;
}

.account-content {
  flex: 1;
  min-width: 0;
}

.account-hub__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 4px 20px;
}

.account-hub__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}

.account-hub__name {
  font-size: 17px;
  font-weight: 750;
  line-height: 1.3;
}

.account-hub__email {
  margin-top: 2px;
  font-size: 13px;
  color: rgba(28, 25, 23, 0.55);
  word-break: break-all;
}

.account-hub__group {
  margin: 0 !important;
}

.account-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: rgba(28, 25, 23, 0.7);
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
}
</style>
