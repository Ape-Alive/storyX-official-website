<template>
  <div class="account-view" :class="{ 'is-mobile': isMobile }">
    <header class="account-hero">
      <h1 class="account-hero__title">我的</h1>
      <p class="account-hero__desc">套餐、订单、资料、邀请与支持集中在此页</p>
    </header>

    <section
      v-for="section in sections"
      :id="section.id"
      :key="section.id"
      class="account-section"
    >
      <component :is="section.component" embedded />
    </section>
  </div>
</template>

<script setup>
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDevice } from '@/utils/device'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'
import { accountSections } from '@/config/accountNav'
import MyPackagesView from './MyPackagesView.vue'
import OrdersView from '../OrdersView.vue'
import ProfileView from './ProfileView.vue'
import InviteView from './InviteView.vue'
import ContactView from '../ContactView.vue'

const route = useRoute()
const { isMobile } = useDevice()
const { finishPageBoot } = useDashboardPageBoot()

const componentMap = {
  packages: MyPackagesView,
  orders: OrdersView,
  profile: ProfileView,
  invite: InviteView,
  contact: ContactView,
}

const sections = accountSections.map((item) => ({
  ...item,
  component: componentMap[item.id],
}))

const scrollToHash = () => {
  const hash = (route.hash || '').replace(/^#/, '')
  if (!hash) return
  nextTick(() => {
    const el = document.getElementById(hash)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

onMounted(() => {
  finishPageBoot()
  scrollToHash()
})

watch(() => route.hash, scrollToHash)
</script>

<style scoped>
.account-view {
  width: 100%;
  max-width: 960px;
  color: #1c1917;
}

.account-hero {
  margin-bottom: 8px;
}

.account-hero__title {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.account-hero__desc {
  margin: 0;
  font-size: 14px;
  color: rgba(28, 25, 23, 0.55);
}

.account-section {
  padding: 28px 0 8px;
  border-top: 1px solid rgba(28, 25, 23, 0.1);
  scroll-margin-top: 88px;
}

.account-section:first-of-type {
  margin-top: 20px;
}

.account-view.is-mobile .account-hero__title {
  font-size: 22px;
}

.account-view.is-mobile .account-section {
  padding: 20px 0 4px;
  scroll-margin-top: 72px;
}
</style>
