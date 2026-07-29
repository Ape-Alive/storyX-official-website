import { ref, inject, provide, watch, nextTick, unref } from 'vue'

export const DASHBOARD_PAGE_BOOT_KEY = Symbol('dashboardPageBoot')

/**
 * 控制台页面首屏加载遮罩（供 Layout provide）
 * @param {{ enabled: import('vue').Ref<boolean> | boolean, routePath: import('vue').Ref<string> | (() => string) }} options
 */
export function createDashboardPageBoot({ enabled, routePath }) {
  const loading = ref(false)
  let bootId = 0
  let tracked = false
  let safetyTimer = null

  const isEnabled = () => !!unref(enabled)

  const clearSafety = () => {
    if (safetyTimer) {
      clearTimeout(safetyTimer)
      safetyTimer = null
    }
  }

  const start = () => {
    clearSafety()
    if (!isEnabled()) {
      loading.value = false
      tracked = false
      return
    }
    bootId += 1
    tracked = false
    loading.value = true
    const id = bootId
    // 页面若未登记 boot（异常/空页），避免遮罩永久挂起
    nextTick(() => {
      safetyTimer = setTimeout(() => {
        if (bootId === id && !tracked) {
          loading.value = false
        }
      }, 400)
    })
  }

  /**
   * 当前菜单页登记首屏任务；完成后关闭遮罩（成功/失败都算完成）
   * @param {() => Promise<unknown> | Promise<unknown>} task
   */
  const run = async (task) => {
    if (!isEnabled()) {
      if (typeof task === 'function') await task()
      else await task
      return
    }

    tracked = true
    const id = bootId
    loading.value = true
    try {
      if (typeof task === 'function') await task()
      else await task
    } finally {
      if (bootId === id) {
        loading.value = false
      }
    }
  }

  /** 无首屏接口的页面直接结束 */
  const finish = () => {
    if (!isEnabled()) {
      loading.value = false
      return
    }
    tracked = true
    loading.value = false
  }

  watch(
    () => (typeof routePath === 'function' ? routePath() : unref(routePath)),
    () => {
      start()
    },
    { immediate: true },
  )

  watch(
    () => unref(enabled),
    (on) => {
      if (!on) {
        clearSafety()
        loading.value = false
      } else {
        start()
      }
    },
  )

  const api = { loading, run, finish, start }
  return api
}

export function provideDashboardPageBoot(api) {
  provide(DASHBOARD_PAGE_BOOT_KEY, api)
  return api
}

/**
 * 子页面使用：登记首屏接口 batch
 */
export function useDashboardPageBoot() {
  const api = inject(DASHBOARD_PAGE_BOOT_KEY, null)
  return {
    runPageBoot: async (task) => {
      if (!api) {
        if (typeof task === 'function') await task()
        else await task
        return
      }
      return api.run(task)
    },
    finishPageBoot: () => {
      api?.finish?.()
    },
    pageBootLoading: api?.loading,
  }
}
