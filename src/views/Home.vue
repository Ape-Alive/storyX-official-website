<template>
  <div class="story-home">
    <Transition name="story-loader">
      <div
        v-if="showLoader"
        class="story-loader"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="story-loader__glow" aria-hidden="true" />
        <div class="story-loader__ember" aria-hidden="true">
          <span /><span /><span />
        </div>
        <p class="story-loader__brand">绘火AI</p>
        <p class="story-loader__hint">{{ loaderHint }}</p>
        <div class="story-loader__track" aria-hidden="true">
          <div class="story-loader__fill" :style="{ width: `${loadProgress}%` }" />
        </div>
        <p class="story-loader__pct">{{ Math.round(loadProgress) }}%</p>
      </div>
    </Transition>

    <div class="story-home__stage" :class="{ 'is-dimmed': showLoader }">
      <video
        ref="videoRef"
        class="story-home__video"
        playsinline
        preload="metadata"
        :poster="config.poster"
        @loadedmetadata="onLoadedMetadata"
        @canplay="onCanPlay"
        @progress="onVideoProgress"
      >
        <source
          v-for="source in config.videoSources"
          :key="source.src"
          :src="source.src"
          :type="source.type"
        />
      </video>

      <div class="story-home__veil" aria-hidden="true" />

      <aside
        class="story-home__copy"
        :class="[copySideClass, { 'is-ready': copyReady }]"
      >
        <div :key="activeSegment.id" class="story-home__copy-inner">
          <p class="story-home__eyebrow">{{ activeSegment.theme }}</p>
          <h1 class="story-home__title">
            <span>{{ typedTitle }}</span><span v-if="isTypingTitle" class="story-home__caret" />
          </h1>
          <p class="story-home__desc" :class="{ 'is-visible': showDesc }">
            {{ typedDesc }}<span v-if="isTypingDesc" class="story-home__caret" />
          </p>
          <div class="story-home__actions" :class="{ 'is-visible': showActions }">
            <router-link
              v-if="activeSegment.ctaLink"
              :to="activeSegment.ctaLink"
              class="story-home__cta"
            >
              {{ activeSegment.cta }}
            </router-link>
            <div v-if="activeSegment.links?.length" class="story-home__links">
              <router-link
                v-for="link in activeSegment.links"
                :key="link.label"
                :to="link.to"
                class="story-home__link"
              >
                {{ link.label }}
              </router-link>
            </div>
          </div>
        </div>
      </aside>

      <footer class="story-home__bottom">
        <div class="story-home__status">
          <template v-if="!hasStarted">
            <span>即将开始…</span>
          </template>
          <template v-else>
            <span>{{ statusIndex }}</span>
            <span class="story-home__status-sep">•</span>
            <span>{{ activeSegment.theme }}</span>
          </template>
        </div>

        <div class="story-home__timeline" role="navigation" aria-label="故事段落">
          <button
            v-for="(seg, index) in segments"
            :key="seg.id"
            type="button"
            class="story-home__seg"
            :class="{
              'is-active': index === activeIndex,
              'is-done': index < activeIndex
            }"
            @click="jumpToSegment(index)"
          >
            <span class="story-home__seg-track">
              <span
                class="story-home__seg-fill"
                :style="{ width: `${segmentFillWidth(index)}%` }"
              />
            </span>
            <span class="story-home__seg-label">
              {{ String(index + 1).padStart(2, '0') }} {{ seg.label }}
            </span>
          </button>
        </div>

        <div class="story-home__controls">
          <button
            class="story-home__icon-btn"
            type="button"
            :aria-pressed="!isMuted"
            :title="isMuted ? '开启声音' : '关闭声音'"
            @click="toggleSound"
          >
            <el-icon :size="20">
              <Mute v-if="isMuted" />
              <Microphone v-else />
            </el-icon>
          </button>
          <button
            class="story-home__icon-btn"
            type="button"
            :title="isPaused ? '继续' : '暂停'"
            @click="togglePause"
          >
            <el-icon :size="20">
              <VideoPlay v-if="isPaused || !isPlaying" />
              <VideoPause v-else />
            </el-icon>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Microphone, Mute, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { homeStoryConfig } from '@/config/homeStory'

const config = homeStoryConfig
const segments = config.segments
const setHomeChromeHidden = inject('setHomeChromeHidden', () => {})

const videoRef = ref(null)
const activeIndex = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)
const isPaused = ref(false)
const segmentFinished = ref(false)
const isMuted = ref(true)
const hasStarted = ref(false)
/** 加载结束并等待 1 秒后，才允许手势开播（带声） */
const readyToStart = ref(false)

const showLoader = ref(true)
const loadProgress = ref(0)
const loaderHint = ref('正在点燃…')

const typedTitle = ref('')
const typedDesc = ref('')
const isTypingTitle = ref(false)
const isTypingDesc = ref(false)
const showDesc = ref(false)
const showActions = ref(false)
const copyReady = ref(false)

let progressRaf = 0
let loadRaf = 0
let wheelAccum = 0
let touchStartY = 0
let typeTimers = []
let playToken = 0
let navLocked = false
/** 一次滑动只允许切一段，防止触控板连续 wheel 连跳 */
let wheelNavCooldownUntil = 0
let progressTarget = 6
let posterReady = false
let metaReady = false
let canPlayReady = false
let loadFinished = false
let loadStartedAt = 0
/** 是否已在用户手势里解锁过声音（自动播无法带声） */
let audioUnlocked = false
/** 加载完成后延迟开播的定时器（刷新/卸载必须清空） */
let startPlayTimer = null
let loadFailSafeTimer = null

const clearStartPlayTimer = () => {
  if (startPlayTimer != null) {
    clearTimeout(startPlayTimer)
    startPlayTimer = null
  }
}

const clearLoadFailSafeTimer = () => {
  if (loadFailSafeTimer != null) {
    clearTimeout(loadFailSafeTimer)
    loadFailSafeTimer = null
  }
}

const armWheelNavCooldown = (ms = 700) => {
  wheelNavCooldownUntil = performance.now() + ms
  wheelAccum = 0
}

const activeSegment = computed(() => segments[activeIndex.value] || segments[0])

const copySideClass = computed(() =>
  activeIndex.value % 2 === 0 ? 'is-right' : 'is-left'
)

const clearTypeTimers = () => {
  typeTimers.forEach((id) => clearTimeout(id))
  typeTimers = []
}

const typeText = (fullText, targetRef, typingFlagRef, speed = 42) =>
  new Promise((resolve) => {
    targetRef.value = ''
    typingFlagRef.value = true
    let i = 0
    const step = () => {
      if (i >= fullText.length) {
        typingFlagRef.value = false
        resolve()
        return
      }
      targetRef.value += fullText[i]
      i += 1
      typeTimers.push(setTimeout(step, speed))
    }
    step()
  })

const runCopyReveal = async () => {
  if (showLoader.value) return
  clearTypeTimers()
  copyReady.value = false
  showDesc.value = false
  showActions.value = false
  typedTitle.value = ''
  typedDesc.value = ''
  isTypingTitle.value = false
  isTypingDesc.value = false

  await nextTick()
  copyReady.value = true

  const seg = activeSegment.value
  await typeText(seg.title || '', typedTitle, isTypingTitle, 48)
  showDesc.value = true
  await typeText(seg.desc || '', typedDesc, isTypingDesc, 22)
  showActions.value = true
}

watch(activeIndex, () => {
  runCopyReveal()
})

const statusIndex = computed(() => {
  const total = String(segments.length).padStart(2, '0')
  const current = String(activeIndex.value + 1).padStart(2, '0')
  return `${current}/${total}`
})

const segmentProgressPct = computed(() => {
  const seg = activeSegment.value
  const span = Math.max(seg.end - seg.start, 0.001)
  const local = (currentTime.value - seg.start) / span
  return Math.min(100, Math.max(0, local * 100))
})

const segmentFillWidth = (index) => {
  if (index < activeIndex.value) return 100
  if (index > activeIndex.value) return 0
  return segmentProgressPct.value
}

const clearProgressLoop = () => {
  if (progressRaf) {
    cancelAnimationFrame(progressRaf)
    progressRaf = 0
  }
}

const bumpLoadProgress = (value, hint) => {
  progressTarget = Math.max(progressTarget, Math.min(100, value))
  if (hint) loaderHint.value = hint
}

const finishLoading = async () => {
  if (loadFinished) return
  loadFinished = true
  bumpLoadProgress(100, '准备就绪')
  const minShow = 700
  const wait = Math.max(0, minShow - (performance.now() - loadStartedAt))
  await new Promise((r) => setTimeout(r, wait))
  await new Promise((r) => {
    const check = () => {
      if (loadProgress.value >= 98) r()
      else requestAnimationFrame(check)
    }
    check()
  })
  showLoader.value = false
  setHomeChromeHidden(false)
  await nextTick()
  runCopyReveal()

  // 加载成功后 1 秒自动开播；刷新/卸载时 clearStartPlayTimer 置空
  clearStartPlayTimer()
  startPlayTimer = setTimeout(async () => {
    startPlayTimer = null
    if (hasStarted.value) return
    readyToStart.value = true
    hasStarted.value = true
    audioUnlocked = false
    await ensureVideoReady()
    if (!hasStarted.value) return
    playSegment(0, { fromStart: true })
  }, 1000)
}

/** 自动播前尽量等到有可播数据，避免卡在锁死状态 */
const ensureVideoReady = () =>
  new Promise((resolve) => {
    const video = videoRef.value
    if (!video) {
      resolve()
      return
    }
    video.preload = 'auto'
    if (video.readyState >= 2) {
      resolve()
      return
    }
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      video.removeEventListener('canplay', done)
      video.removeEventListener('loadeddata', done)
      clearTimeout(timer)
      resolve()
    }
    video.addEventListener('canplay', done)
    video.addEventListener('loadeddata', done)
    const timer = setTimeout(done, 2500)
  })

const tryFinishLoading = () => {
  if (posterReady && metaReady) {
    bumpLoadProgress(canPlayReady ? 96 : 82, canPlayReady ? '即将开始' : '即将就绪')
  }
  if (posterReady && metaReady && (canPlayReady || performance.now() - loadStartedAt > 4500)) {
    finishLoading()
  }
}

const tickLoadProgress = () => {
  if (loadFinished && loadProgress.value >= 100) {
    loadRaf = 0
    return
  }
  const cur = loadProgress.value
  const gap = progressTarget - cur
  if (gap > 0.15) {
    loadProgress.value = cur + Math.max(0.35, gap * 0.08)
  } else if (!loadFinished && progressTarget < 78) {
    progressTarget = Math.min(78, progressTarget + 0.08)
    loadProgress.value = Math.min(progressTarget, cur + 0.12)
  }
  loadRaf = requestAnimationFrame(tickLoadProgress)
}

const finishSegment = () => {
  const video = videoRef.value
  const seg = activeSegment.value
  clearProgressLoop()
  playToken += 1
  if (video) {
    video.pause()
    const endAt = Math.min(seg.end, Number.isFinite(video.duration) ? video.duration : seg.end)
    video.currentTime = endAt
    currentTime.value = endAt
  }
  isPlaying.value = false
  isPaused.value = false
  segmentFinished.value = true
  navLocked = false
  wheelAccum = 0
}

const watchSegmentEnd = (seg, token, startedAt = performance.now()) => {
  clearProgressLoop()
  let lastTime = -1
  let stallFrames = 0

  const tick = () => {
    if (token !== playToken) return
    const video = videoRef.value
    if (!video) return

    currentTime.value = video.currentTime || 0

    // seek 刚开始的一小段时间内不判定结束，避免误切段
    const warmedUp = performance.now() - startedAt > 450
    if (warmedUp && currentTime.value >= seg.end - 0.05) {
      finishSegment()
      return
    }

    if (isPaused.value) return

    if (video.paused && navLocked) {
      video.play().catch(() => {})
    }

    if (warmedUp && Math.abs(currentTime.value - lastTime) < 0.001) {
      stallFrames += 1
      if (stallFrames > 180) {
        video.play().catch(() => {})
      }
      // 卡住太久只解锁，不伪装成「播完」，避免连跳多段
      if (stallFrames > 480) {
        isPlaying.value = false
        navLocked = false
        segmentFinished.value = true
        clearProgressLoop()
        return
      }
    } else {
      stallFrames = 0
      lastTime = currentTime.value
    }

    progressRaf = requestAnimationFrame(tick)
  }
  progressRaf = requestAnimationFrame(tick)
}

const playSegment = (index, { fromStart = true } = {}) => {
  const video = videoRef.value
  const seg = segments[index]
  if (!video || !seg) return

  const token = ++playToken
  const startedAt = performance.now()
  navLocked = true
  wheelAccum = 0
  activeIndex.value = index
  isPaused.value = false
  segmentFinished.value = false
  isPlaying.value = true
  clearProgressLoop()

  if (fromStart) {
    try {
      video.currentTime = seg.start
    } catch (_) {
      /* ignore */
    }
    currentTime.value = seg.start
  }

  video.muted = isMuted.value || !audioUnlocked

  const onPlaying = () => {
    if (token !== playToken) return
    isPlaying.value = true
    navLocked = true
    watchSegmentEnd(seg, token, startedAt)
  }

  const onFail = () => {
    if (token !== playToken) return
    // 播放失败：解锁但不算播完，避免一次滑动连跳多段
    isPlaying.value = false
    navLocked = false
    segmentFinished.value = false
  }

  const p = video.play()
  if (p && typeof p.then === 'function') {
    p.then(onPlaying).catch(() => {
      video.muted = true
      video.play().then(onPlaying).catch(onFail)
    })
  } else {
    onPlaying()
  }
}

/** 必须在用户手势同步栈里调用，才能真正出声 */
const unlockAudioFromGesture = () => {
  if (isMuted.value) return
  audioUnlocked = true
  const video = videoRef.value
  if (!video) return
  video.muted = false
  if ((navLocked || isPlaying.value) && !isPaused.value) {
    const p = video.play()
    if (p?.catch) p.catch(() => {})
  }
}

/** 滑动时若卡在「锁着但已停」的状态，尝试恢复播放（失败不假完成） */
const recoverIfStuck = () => {
  const video = videoRef.value
  if (!video || isPaused.value || showLoader.value) return
  if (!navLocked && !isPlaying.value) return

  const seg = activeSegment.value
  if (video.currentTime >= seg.end - 0.05) {
    finishSegment()
    return
  }

  if (video.paused) {
    video.muted = isMuted.value || !audioUnlocked
    video.play().catch(() => {})
  }
}

const canNavigate = () =>
  !showLoader.value &&
  hasStarted.value &&
  !navLocked &&
  !isPlaying.value &&
  !isPaused.value &&
  segmentFinished.value &&
  performance.now() >= wheelNavCooldownUntil

const ensureStarted = () => {
  if (showLoader.value) return true
  clearStartPlayTimer()
  readyToStart.value = true
  unlockAudioFromGesture()
  if (hasStarted.value) return false
  hasStarted.value = true
  playSegment(0, { fromStart: true })
  return true
}

const goNext = () => {
  if (!canNavigate()) return
  if (activeIndex.value >= segments.length - 1) return
  unlockAudioFromGesture()
  armWheelNavCooldown()
  playSegment(activeIndex.value + 1, { fromStart: true })
}

const goPrev = () => {
  if (!canNavigate()) return
  if (activeIndex.value <= 0) return
  unlockAudioFromGesture()
  armWheelNavCooldown()
  playSegment(activeIndex.value - 1, { fromStart: true })
}

const jumpToSegment = (index) => {
  if (showLoader.value) return
  if (index < 0 || index >= segments.length) return
  clearStartPlayTimer()
  readyToStart.value = true
  unlockAudioFromGesture()
  hasStarted.value = true
  armWheelNavCooldown(300)
  playSegment(index, { fromStart: true })
}

const togglePause = () => {
  if (showLoader.value) return
  const video = videoRef.value
  if (!video) return

  if (!hasStarted.value) {
    ensureStarted()
    return
  }

  if (!video.paused && (isPlaying.value || navLocked)) {
    video.pause()
    clearProgressLoop()
    isPaused.value = true
    isPlaying.value = false
    navLocked = false
    return
  }

  if (segmentFinished.value || video.currentTime >= activeSegment.value.end - 0.05) {
    segmentFinished.value = true
    isPaused.value = false
    goNext()
    return
  }

  isPaused.value = false
  unlockAudioFromGesture()
  playSegment(activeIndex.value, { fromStart: false })
}

const toggleSound = () => {
  if (showLoader.value) return
  const video = videoRef.value
  isMuted.value = !isMuted.value
  if (!video) return

  if (isMuted.value) {
    video.muted = true
    return
  }

  audioUnlocked = true
  video.muted = false
  if (!hasStarted.value) {
    ensureStarted()
    return
  }
  if ((navLocked || isPlaying.value) && !isPaused.value) {
    const p = video.play()
    if (p?.catch) p.catch(() => {})
  }
}

const onWheel = (event) => {
  event.preventDefault()
  if (showLoader.value) return

  unlockAudioFromGesture()
  recoverIfStuck()

  if (ensureStarted()) {
    wheelAccum = 0
    return
  }

  if (performance.now() < wheelNavCooldownUntil) {
    wheelAccum = 0
    return
  }

  if (navLocked || isPlaying.value || isPaused.value || !segmentFinished.value) {
    wheelAccum = 0
    return
  }

  wheelAccum += event.deltaY
  const threshold = config.wheelThreshold || 48
  if (Math.abs(wheelAccum) < threshold) return

  const direction = wheelAccum > 0 ? 1 : -1
  wheelAccum = 0
  if (direction > 0) goNext()
  else goPrev()
}

const onTouchStart = (event) => {
  unlockAudioFromGesture()
  touchStartY = event.touches[0]?.clientY || 0
}

const onTouchEnd = (event) => {
  if (showLoader.value) return
  unlockAudioFromGesture()
  recoverIfStuck()
  if (ensureStarted()) return
  if (!canNavigate()) return
  const endY = event.changedTouches[0]?.clientY || touchStartY
  const delta = touchStartY - endY
  const threshold = config.touchThreshold || 56
  if (Math.abs(delta) < threshold) return
  if (delta > 0) goNext()
  else goPrev()
}

const onKeyDown = (event) => {
  if (showLoader.value) return
  unlockAudioFromGesture()
  recoverIfStuck()
  if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault()
    if (ensureStarted()) return
    goNext()
  } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault()
    if (ensureStarted()) return
    goPrev()
  }
}

const onPointerDown = (event) => {
  if (showLoader.value) return
  unlockAudioFromGesture()
  recoverIfStuck()
  const t = event.target
  if (t && typeof t.closest === 'function') {
    if (t.closest('a, button, input, textarea, select, label')) return
  }
  ensureStarted()
}

const onLoadedMetadata = () => {
  const video = videoRef.value
  if (!video) return
  const last = segments[segments.length - 1]
  if (last && Number.isFinite(video.duration) && last.end > video.duration) {
    last.end = video.duration
  }
  video.pause()
  video.currentTime = segments[0].start
  currentTime.value = segments[0].start
  video.muted = isMuted.value
  metaReady = true
  bumpLoadProgress(72, '故事就绪中…')
  tryFinishLoading()
}

const onCanPlay = () => {
  canPlayReady = true
  bumpLoadProgress(94, '即将开始')
  tryFinishLoading()
}

const onVideoProgress = () => {
  const video = videoRef.value
  if (!video || !video.duration) return
  try {
    if (video.buffered.length > 0) {
      const end = video.buffered.end(video.buffered.length - 1)
      const ratio = end / video.duration
      bumpLoadProgress(55 + ratio * 35)
    }
  } catch (_) {
    /* ignore */
  }
}

const preloadPoster = () => {
  if (!config.poster) {
    posterReady = true
    bumpLoadProgress(40)
    tryFinishLoading()
    return
  }
  const img = new Image()
  img.onload = () => {
    posterReady = true
    bumpLoadProgress(42, '画面加载完成')
    tryFinishLoading()
  }
  img.onerror = () => {
    posterReady = true
    bumpLoadProgress(35)
    tryFinishLoading()
  }
  img.src = config.poster
}

onMounted(() => {
  clearStartPlayTimer()
  clearLoadFailSafeTimer()
  document.body.style.overflow = 'hidden'
  setHomeChromeHidden(true)
  loadStartedAt = performance.now()
  loadRaf = requestAnimationFrame(tickLoadProgress)
  preloadPoster()
  bumpLoadProgress(12, '正在点燃…')

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('pointerdown', onPointerDown, { passive: true })

  loadFailSafeTimer = setTimeout(() => {
    loadFailSafeTimer = null
    posterReady = true
    metaReady = true
    bumpLoadProgress(90, '准备进入')
    finishLoading()
  }, 8000)
})

onUnmounted(() => {
  playToken += 1
  clearProgressLoop()
  clearTypeTimers()
  clearStartPlayTimer()
  clearLoadFailSafeTimer()
  if (loadRaf) cancelAnimationFrame(loadRaf)
  setHomeChromeHidden(false)
  document.body.style.overflow = ''
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('pointerdown', onPointerDown)
})
</script>

<style scoped>
.story-home {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #0b0b0f;
  color: #faf7f2;
}

.story-home__stage {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  transition: opacity 0.55s ease, filter 0.55s ease;
}

.story-home__stage.is-dimmed {
  opacity: 0.35;
  filter: saturate(0.7) blur(2px);
}

.story-loader {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  background:
    radial-gradient(ellipse 70% 55% at 50% 42%, rgba(232, 120, 48, 0.16), transparent 62%),
    radial-gradient(ellipse 50% 40% at 50% 80%, rgba(120, 40, 10, 0.2), transparent 70%),
    #0b0b0f;
}

.story-loader__glow {
  position: absolute;
  width: min(420px, 70vw);
  height: min(420px, 70vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 150, 60, 0.18), transparent 68%);
  animation: loaderPulse 2.4s ease-in-out infinite;
  pointer-events: none;
}

.story-loader__ember {
  position: relative;
  width: 56px;
  height: 72px;
  margin-bottom: 8px;
}

.story-loader__ember span {
  position: absolute;
  left: 50%;
  bottom: 0;
  border-radius: 50% 50% 45% 45%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #ffe0a3 0%, #ff8a2b 42%, #c2410c 100%);
  filter: blur(0.2px);
  animation: emberFlicker 1.1s ease-in-out infinite;
  opacity: 0.9;
}

.story-loader__ember span:nth-child(1) {
  width: 22px;
  height: 42px;
  animation-delay: 0s;
}

.story-loader__ember span:nth-child(2) {
  width: 14px;
  height: 28px;
  left: calc(50% - 12px);
  animation-delay: 0.18s;
  opacity: 0.7;
}

.story-loader__ember span:nth-child(3) {
  width: 12px;
  height: 24px;
  left: calc(50% + 12px);
  animation-delay: 0.32s;
  opacity: 0.65;
}

.story-loader__brand {
  position: relative;
  margin: 0;
  font-family: 'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #faf7f2;
  text-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
  animation: brandIn 0.9s ease both;
}

.story-loader__hint {
  position: relative;
  margin: 0;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  letter-spacing: 0.22em;
  color: rgba(250, 247, 242, 0.55);
}

.story-loader__track {
  position: relative;
  width: min(220px, 48vw);
  height: 2px;
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.story-loader__fill {
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #f59e0b, #fb7185);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.45);
  transition: width 0.15s linear;
}

.story-loader__pct {
  position: relative;
  margin: 0;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(250, 247, 242, 0.4);
  font-variant-numeric: tabular-nums;
}

.story-loader-enter-active,
.story-loader-leave-active {
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.story-loader-enter-from,
.story-loader-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

@keyframes loaderPulse {
  0%, 100% { opacity: 0.55; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes emberFlicker {
  0%, 100% { transform: translateX(-50%) scaleY(0.92) scaleX(1); opacity: 0.75; }
  40% { transform: translateX(-50%) scaleY(1.12) scaleX(0.94); opacity: 1; }
  70% { transform: translateX(-50%) scaleY(0.98) scaleX(1.04); opacity: 0.85; }
}

@keyframes brandIn {
  from { opacity: 0; transform: translateY(12px); letter-spacing: 0.18em; }
  to { opacity: 1; transform: translateY(0); letter-spacing: 0.08em; }
}

.story-home__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  background: #0b0b0f;
  z-index: 0;
}

.story-home__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(8, 8, 12, 0.45) 0%, rgba(8, 8, 12, 0) 24%),
    linear-gradient(0deg, rgba(8, 8, 12, 0.62) 0%, rgba(8, 8, 12, 0) 30%),
    linear-gradient(90deg, rgba(8, 8, 12, 0.1) 45%, rgba(8, 8, 12, 0.35) 100%);
}

.story-home__copy {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  z-index: 4;
  width: min(400px, 38vw);
  pointer-events: none;
  opacity: 0;
  transition: left 0.45s ease, right 0.45s ease, opacity 0.6s ease;
}

.story-home__copy.is-ready {
  opacity: 1;
}

.story-home__copy.is-right {
  right: clamp(24px, 8vw, 96px);
  left: auto;
  text-align: left;
}

.story-home__copy.is-left {
  left: clamp(24px, 8vw, 96px);
  right: auto;
  text-align: left;
}

.story-home__copy-inner {
  pointer-events: auto;
}

.story-home__eyebrow {
  margin: 0 0 12px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(250, 247, 242, 0.55);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.story-home__copy.is-ready .story-home__eyebrow {
  opacity: 1;
  transform: translateY(0);
}

.story-home__title {
  margin: 0 0 16px;
  min-height: 1.2em;
  font-family: 'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: clamp(28px, 3.4vw, 44px);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #faf7f2;
  text-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
}

.story-home__desc {
  margin: 0 0 24px;
  min-height: 3.5em;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(250, 247, 242, 0.72);
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.story-home__desc.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.story-home__caret {
  display: inline-block;
  width: 2px;
  height: 0.9em;
  margin-left: 2px;
  vertical-align: -0.1em;
  background: rgba(250, 247, 242, 0.85);
  animation: caretBlink 0.9s steps(1) infinite;
}

@keyframes caretBlink {
  0%, 45% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.story-home__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.story-home__actions.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.story-home__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 999px;
  background: #faf7f2;
  color: #1c1917;
  text-decoration: none;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.story-home__cta:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.story-home__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.story-home__link {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(250, 247, 242, 0.7);
  text-decoration: none;
  border-bottom: 1px solid rgba(250, 247, 242, 0.28);
  padding-bottom: 2px;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.story-home__link:hover {
  color: #faf7f2;
  border-color: rgba(250, 247, 242, 0.7);
}

.story-home__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(140px, 200px) 1fr auto;
  align-items: end;
  gap: 18px;
  padding: 0 28px 28px;
}

.story-home__status {
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(250, 247, 242, 0.62);
  padding-bottom: 8px;
  white-space: nowrap;
}

.story-home__status-sep {
  margin: 0 6px;
  opacity: 0.5;
}

.story-home__timeline {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  min-width: 0;
  user-select: none;
}

.story-home__seg {
  flex: 1 1 0;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.story-home__seg-track {
  display: block;
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  overflow: hidden;
  margin-bottom: 10px;
}

.story-home__seg-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7c6cf0, #5b8def);
  width: 0;
  transition: width 0.15s linear;
}

.story-home__seg.is-done .story-home__seg-fill {
  background: rgba(250, 247, 242, 0.55);
}

.story-home__seg-label {
  display: block;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(250, 247, 242, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-home__seg.is-active .story-home__seg-label {
  color: #faf7f2;
}

.story-home__seg.is-done .story-home__seg-label {
  color: rgba(250, 247, 242, 0.65);
}

.story-home__controls {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.story-home__icon-btn {
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1c1917;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.story-home__icon-btn:hover {
  transform: translateY(-1px);
  background: #fff;
}

.story-home__icon-btn[aria-pressed='true'] {
  background: #2f2a27;
  color: #faf7f2;
}

@media (max-width: 960px) {
  .story-home__copy,
  .story-home__copy.is-left,
  .story-home__copy.is-right {
    right: 16px;
    left: 16px;
    top: auto;
    bottom: 188px;
    transform: none;
    width: auto;
    max-width: 420px;
  }

  .story-home__title {
    font-size: 28px;
  }

  .story-home__bottom {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 10px;
    /* 为底部 Tab 栏预留空间 */
    padding: 0 16px calc(18px + 64px + env(safe-area-inset-bottom, 0px));
  }

  .story-home__status {
    grid-column: 1;
    white-space: normal;
  }

  .story-home__controls {
    grid-column: 2;
    grid-row: 1;
  }

  .story-home__timeline {
    grid-column: 1 / -1;
  }

  .story-home__seg-label {
    font-size: 10px;
  }

  .story-home__icon-btn {
    width: 42px;
    height: 42px;
  }
}
</style>
