<template>
  <div class="contact-view">
    <div class="contact-card">
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
            <span class="info-text">vip@storyx.ai</span>
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
            <input class="form-input" placeholder="姓名 / 昵称" />
          </div>
          <div class="form-group">
            <label class="form-label">邮箱地址</label>
            <input class="form-input" placeholder="name@domain.com" />
          </div>
        </div>
        <div class="form-group full-width">
          <label class="form-label">咨询详情</label>
          <textarea
            class="form-textarea"
            placeholder="请详细描述您的需求或遇到的技术问题..."
          ></textarea>
        </div>
        <button class="submit-btn">提交反馈</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Message, ChatLineRound } from '@element-plus/icons-vue'
</script>

<style scoped>
.contact-view {
  animation: fadeInSlide 0.5s ease-out;
  padding-top: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.contact-card {
  background: var(--bg-card);
  border: none;
  border-radius: 32px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 2fr 3fr;
  box-shadow: var(--shadow-lg);
  transition: background-color 0.3s ease;
}

@media (max-width: 1024px) {
  .contact-card {
    grid-template-columns: 1fr;
  }
}

.contact-left {
  background: var(--accent-gradient);
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
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(168, 85, 247, 0.8);
}

.info-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-family: 'Inter', sans-serif;
}

.contact-footer {
  font-size: 10px;
  color: rgba(168, 85, 247, 0.8);
  font-family: 'Courier New', monospace;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  margin-top: 40px;
}

.contact-right {
  padding: 48px;
  background: var(--bg-card);
  transition: background-color 0.3s ease;
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
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  outline: none;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: rgba(147, 51, 234, 0.3);
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
}

.submit-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
</style>
