<template>
  <div class="invite-view" :class="{ 'is-mobile': isMobile }" v-loading="loading">
    <header class="invite-header">
      <div>
        <h2 class="invite-title">客户端邀请</h2>
        <p v-if="!isMobile" class="invite-desc">查看分销身份、邀请码与奖励策略</p>
      </div>
      <button type="button" class="refresh-btn" :disabled="loading" @click="loadInvite">
        刷新
      </button>
    </header>

    <div v-if="error" class="invite-error">{{ error }}</div>

    <template v-else-if="!loading && invite">
      <div class="invite-grid">
        <div class="invite-card">
          <div class="invite-card__label">分销身份</div>
          <div class="invite-card__value">
            {{ invite.distributorLevel?.name || '未设置等级' }}
          </div>
          <div class="invite-card__sub">
            {{ invite.distributorStatusLabel || (invite.isDistributor ? '已开通' : '未开通') }}
          </div>
        </div>

        <div class="invite-card">
          <div class="invite-card__label">我的邀请码</div>
          <div class="invite-code-row">
            <span class="invite-code">{{ invite.inviteCode || '—' }}</span>
            <button
              type="button"
              class="copy-btn"
              :disabled="!invite.inviteCode"
              @click="copyCode"
            >
              复制
            </button>
          </div>
          <div class="invite-card__sub">分享给新用户注册时填写</div>
        </div>

        <div class="invite-card">
          <div class="invite-card__label">邀请数据</div>
          <div class="invite-stats">
            <div>
              <div class="invite-stat-num">{{ invite.stats?.inviteeCount ?? 0 }}</div>
              <div class="invite-stat-label">已邀请</div>
            </div>
            <div>
              <div class="invite-stat-num">{{ invite.stats?.rewardCount ?? 0 }}</div>
              <div class="invite-stat-label">奖励次数</div>
            </div>
            <div>
              <div class="invite-stat-num">{{ formatQuota(invite.stats?.rewardQuotaTotal) }}</div>
              <div class="invite-stat-label">累计积分</div>
            </div>
          </div>
        </div>
      </div>

      <section class="invite-strategy">
        <h3 class="invite-strategy__title">邀请奖励策略</h3>
        <p class="invite-strategy__hint">被邀请人付费后，按策略向您发放积分</p>
        <div v-if="!(invite.rewardStrategies || []).length" class="invite-empty">
          当前等级暂无生效的邀请奖励策略
        </div>
        <div
          v-for="s in invite.rewardStrategies || []"
          :key="s.id || s.name"
          class="strategy-item"
        >
          <div class="strategy-item__name">{{ s.name }}</div>
          <div class="strategy-item__meta">
            <span v-if="s.rewardQuota != null">奖励 {{ formatQuota(s.rewardQuota) }} 积分</span>
            <span v-if="s.appliesToAllPackages"> · 全部套餐</span>
            <span v-else-if="(s.packages || []).length">
              ·
              {{
                (s.packages || [])
                  .map((p) => p.displayName || p.name)
                  .filter(Boolean)
                  .join('、') || '指定套餐'
              }}
            </span>
          </div>
          <p v-if="s.description" class="strategy-item__desc">{{ s.description }}</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { showSuccessToast, showFailToast } from 'vant'
import { getMyInvite } from '@/api/invite'
import { formatQuota } from '@/composables/useMyActivePackages'
import { useDevice } from '@/utils/device'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'

const { isMobile } = useDevice()
const { runPageBoot } = useDashboardPageBoot()

const invite = ref(null)
const loading = ref(false)
const error = ref('')

const loadInvite = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getMyInvite()
    if (response.success) {
      invite.value = response.data || null
    } else {
      invite.value = null
      error.value = response.message || '加载邀请信息失败'
    }
  } catch (err) {
    console.error('加载邀请信息失败:', err)
    invite.value = null
    error.value = err?.message || '加载邀请信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const notifySuccess = (msg) => {
  if (isMobile.value) showSuccessToast(msg)
  else ElMessage.success(msg)
}

const copyCode = async () => {
  const code = invite.value?.inviteCode
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    notifySuccess('邀请码已复制')
  } catch {
    if (isMobile.value) showFailToast('复制失败')
    else ElMessage.error('复制失败')
  }
}

onMounted(() => {
  runPageBoot(() => loadInvite())
})
</script>

<style scoped>
.invite-view {
  color: #1c1917;
}

.invite-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.invite-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.invite-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(28, 25, 23, 0.55);
}

.refresh-btn,
.copy-btn {
  border: 1px solid rgba(28, 25, 23, 0.12);
  border-radius: 8px;
  background: rgba(28, 25, 23, 0.04);
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  color: #1c1917;
}

.refresh-btn:disabled,
.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invite-error {
  padding: 16px;
  border-radius: 10px;
  background: rgba(161, 98, 7, 0.08);
  color: #a16207;
  font-size: 14px;
}

.invite-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.invite-card {
  padding: 16px;
  border: 1px solid rgba(28, 25, 23, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
}

.invite-card__label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(28, 25, 23, 0.45);
  margin-bottom: 8px;
}

.invite-card__value {
  font-size: 18px;
  font-weight: 800;
}

.invite-card__sub {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.5);
}

.invite-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.invite-code {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-family: 'Space Grotesk', ui-monospace, monospace;
}

.invite-stats {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.invite-stat-num {
  font-size: 18px;
  font-weight: 800;
}

.invite-stat-label {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(28, 25, 23, 0.5);
}

.invite-strategy__title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 750;
}

.invite-strategy__hint {
  margin: 0 0 14px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.5);
}

.invite-empty {
  font-size: 13px;
  color: rgba(28, 25, 23, 0.5);
  padding: 12px 0;
}

.strategy-item {
  padding: 12px 0;
  border-top: 1px solid rgba(28, 25, 23, 0.08);
}

.strategy-item__name {
  font-size: 14px;
  font-weight: 750;
}

.strategy-item__meta {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.55);
}

.strategy-item__desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(28, 25, 23, 0.5);
  line-height: 1.45;
}

.invite-view.is-mobile .invite-title {
  font-size: 18px;
}

.invite-view.is-mobile .invite-grid {
  grid-template-columns: 1fr;
}
</style>
