/**
 * 设备检测：移动端 / PC
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

const MOBILE_UA_RE =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i

export const MOBILE_MAX_WIDTH = 960

/**
 * 同步判断当前是否为移动端（含窄屏布局）
 * @returns {boolean}
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent || ''
  const mobileUa = MOBILE_UA_RE.test(ua)
  const narrowScreen = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  return mobileUa || narrowScreen || (coarsePointer && narrowScreen)
}

/**
 * 同步判断是否为 PC 端
 * @returns {boolean}
 */
export function isPcDevice() {
  return !isMobileDevice()
}

/**
 * Vue 组合式：响应式监听移动端 / PC 切换
 * @returns {{ isMobile: import('vue').Ref<boolean>, isPc: import('vue').ComputedRef<boolean> }}
 */
export function useDevice() {
  const isMobile = ref(typeof window !== 'undefined' ? isMobileDevice() : false)
  const isPc = computed(() => !isMobile.value)

  let mediaQuery = null

  const update = () => {
    isMobile.value = isMobileDevice()
  }

  onMounted(() => {
    update()
    mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', update)
    } else {
      mediaQuery.addListener?.(update)
    }
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    if (mediaQuery?.removeEventListener) {
      mediaQuery.removeEventListener('change', update)
    } else {
      mediaQuery?.removeListener?.(update)
    }
    window.removeEventListener('resize', update)
  })

  return { isMobile, isPc }
}
