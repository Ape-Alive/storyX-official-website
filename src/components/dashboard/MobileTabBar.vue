<template>
  <van-tabbar
    v-model="active"
    route
    safe-area-inset-bottom
    class="dashboard-vant-tabbar"
  >
    <van-tabbar-item
      v-for="item in navItems"
      :key="item.id"
      :to="item.path"
      :icon="item.vantIcon"
    >
      {{ item.shortLabel }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mobileNavItems } from '@/config/dashboardNav'

const route = useRoute()
const navItems = mobileNavItems

const active = computed({
  get() {
    const idx = navItems.findIndex((item) => route.path === item.path)
    return idx >= 0 ? idx : 0
  },
  set() {
    /* route 模式由 van-tabbar-item :to 驱动 */
  }
})
</script>

<style scoped>
.dashboard-vant-tabbar {
  z-index: 200;
}
</style>
