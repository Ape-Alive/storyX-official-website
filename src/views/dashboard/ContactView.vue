<template>
  <div class="contact-view" :class="{ 'is-mobile': isMobile }">
    <!-- 移动端 -->
    <template v-if="isMobile">
      <div class="mobile-support-card">
        <h3 class="mobile-support-title">技术支持</h3>
        <p class="mobile-support-desc">
          如果您在制片过程中遇到技术难题或需要定制化的企业解决方案，请随时联系我们的专家团队。
        </p>
        <div class="mobile-support-info">
          <div class="mobile-info-item">
            <div class="mobile-info-icon">
              <van-icon name="envelop-o" size="18" />
            </div>
            <a class="mobile-info-text" href="mailto:vip@huihuo.ai">vip@huihuo.ai</a>
          </div>
          <div class="mobile-info-item">
            <div class="mobile-info-icon">
              <van-icon name="chat-o" size="18" />
            </div>
            <span class="mobile-info-text">在线实时聊天（标准工时）</span>
          </div>
        </div>
        <div class="mobile-support-footer">服务可用率：99.9% / SLA 已激活</div>
      </div>

      <van-form class="mobile-form" @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.name"
            name="name"
            label="您的姓名"
            placeholder="姓名 / 昵称"
            :rules="[{ required: true, message: '请填写姓名' }]"
          />
          <van-field
            v-model="form.email"
            name="email"
            label="邮箱地址"
            placeholder="name@domain.com"
            :rules="[
              { required: true, message: '请填写邮箱' },
              { pattern: /.+@.+\..+/, message: '邮箱格式不正确' }
            ]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            type="tel"
            maxlength="11"
            label="手机号码"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请填写手机号' },
              { pattern: /^1\d{10}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="form.content"
            name="content"
            rows="4"
            autosize
            type="textarea"
            label="咨询详情"
            placeholder="请详细描述您的需求或遇到的技术问题..."
            :rules="[{ required: true, message: '请填写咨询详情' }]"
          />
        </van-cell-group>
        <div class="mobile-submit-wrap">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            提交反馈
          </van-button>
        </div>
      </van-form>
    </template>

    <!-- 桌面端 -->
    <div v-else class="contact-card">
      <div class="contact-left">
        <h3 class="contact-title">技术支持</h3>
        <p class="contact-desc">
          如果您在制片过程中遇到技术难题或需要定制化的企业解决方案，请随时联系我们的专家团队。
        </p>
        <div class="contact-info">
          <div class="info-item">
            <div class="info-icon">
              <el-icon :size="20"><Message /></el-icon>
            </div>
            <span class="info-text">vip@huihuo.ai</span>
          </div>
          <div class="info-item">
            <div class="info-icon">
              <el-icon :size="20"><ChatLineRound /></el-icon>
            </div>
            <span class="info-text">在线实时聊天 (标准工时)</span>
          </div>
        </div>
        <div class="contact-footer">
          服务可用率: 99.9% / SLA 已激活
        </div>
      </div>
      <div class="contact-right">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">您的姓名</label>
            <input v-model="form.name" class="form-input" placeholder="姓名 / 昵称" />
          </div>
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <input v-model="form.email" class="form-input" placeholder="name@domain.com" />
          </div>
          <div class="form-group">
            <label class="form-label">手机号码</label>
            <input
              v-model="form.phone"
              class="form-input"
              type="tel"
              maxlength="11"
              placeholder="请输入手机号"
            />
          </div>
        </div>
        <div class="form-group full-width">
          <label class="form-label">咨询详情</label>
          <textarea
            v-model="form.content"
            class="form-textarea"
            placeholder="请详细描述您的需求或遇到的技术问题..."
          ></textarea>
        </div>
        <button class="submit-btn" type="button" @click="handleSubmit">提交反馈</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { Message, ChatLineRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { showSuccessToast, showFailToast } from 'vant'
import { useDevice } from '@/utils/device'
import { submitFeedback } from '@/api/feedback'
import { useDashboardPageBoot } from '@/composables/useDashboardPageBoot'

const { isMobile } = useDevice()
const { finishPageBoot } = useDashboardPageBoot()
const submitting = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  content: ''
})

onMounted(() => {
  finishPageBoot()
})

const handleSubmit = async () => {
  if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.content.trim()) {
    if (isMobile.value) showFailToast('请完整填写表单')
    else ElMessage.warning('请完整填写表单')
    return
  }
  if (!/.+@.+\..+/.test(form.email.trim())) {
    if (isMobile.value) showFailToast('邮箱格式不正确')
    else ElMessage.warning('邮箱格式不正确')
    return
  }
  if (!/^1\d{10}$/.test(form.phone.trim())) {
    if (isMobile.value) showFailToast('手机号格式不正确')
    else ElMessage.warning('手机号格式不正确')
    return
  }

  submitting.value = true
  try {
    const response = await submitFeedback({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      content: form.content.trim()
    })
    if (response.success) {
      if (isMobile.value) showSuccessToast('已提交，我们会尽快联系您')
      else ElMessage.success('已提交，我们会尽快联系您')
      form.name = ''
      form.email = ''
      form.phone = ''
      form.content = ''
    } else {
      const msg = response.message || '提交失败，请稍后重试'
      if (isMobile.value) showFailToast(msg)
      else ElMessage.error(msg)
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    const msg = error?.response?.data?.message || error?.message || '提交失败，请稍后重试'
    if (isMobile.value) showFailToast(msg)
    else ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contact-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.contact-card {
  background: var(--bg-card);
  border: none;
  border-radius: 32px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 2fr 3fr;
  box-shadow: var(--shadow-lg);
}

@media (max-width: 1024px) {
  .contact-card {
    grid-template-columns: 1fr;
  }
}

.contact-left {
  background: var(--soft-gradient);
  padding: 48px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.contact-title {
  font-size: 32px;
  font-weight: 900;
  margin: 0 0 16px 0;
  font-style: italic;
  letter-spacing: -0.02em;
  font-family: 'Space Grotesk', sans-serif;
}

.contact-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  font-family: 'Inter', sans-serif;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

.info-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-family: 'Inter', sans-serif;
}

.contact-footer {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin-top: 40px;
}

.contact-right {
  padding: 48px;
  background: var(--bg-card);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 10px;
  font-weight: 900;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  outline: none;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--border-color-strong);
  background: var(--bg-card);
}

.form-textarea {
  height: 160px;
  resize: none;
}

.submit-btn {
  width: 100%;
  padding: 20px;
  background: black;
  color: white;
  border-radius: 16px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', sans-serif;
  margin-top: 24px;
}

.submit-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* 移动端 */
.contact-view.is-mobile {
  padding-top: 0;
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-support-card {
  margin: 0;
  padding: 16px 14px 14px;
  border-radius: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.mobile-support-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--text-primary);
  line-height: 1.25;
}

.mobile-support-desc {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.mobile-support-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-info-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(147, 51, 234, 0.08);
  color: #9333ea;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mobile-info-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
}

.mobile-support-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.mobile-form {
  padding-bottom: 0;
}

.mobile-form :deep(.van-cell-group--inset) {
  margin: 0;
}

.mobile-form :deep(.van-field__label) {
  width: 5.2em;
  color: var(--text-tertiary);
  font-weight: 600;
}

.mobile-submit-wrap {
  margin: 12px 0 0;
}

.mobile-submit-wrap :deep(.van-button--primary) {
  --van-button-primary-background: #1c1917;
  --van-button-primary-border-color: #1c1917;
  font-weight: 700;
}
</style>
