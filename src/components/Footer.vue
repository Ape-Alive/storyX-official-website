<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="footer-logo-glow"></div>
          <div class="footer-logo-icon">
            <el-icon :size="16" color="#000">
              <Film />
            </el-icon>
          </div>
        </div>
        <span class="footer-brand-text">STORYX</span>
        <p class="footer-tagline">Autonomous Cinematic Intelligence Lab</p>
      </div>

      <div class="footer-links">
        <a href="#" class="footer-link">作品案例</a>
        <a href="#" class="footer-link">技术架构</a>
        <a href="#" class="footer-link">版权合规</a>
        <a href="#" class="footer-link">开发者</a>
      </div>

      <p class="footer-copyright">
        © 2026 STORYX STUDIOS.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { Film } from '@element-plus/icons-vue'
</script>

<style scoped>
.footer {
  padding: 96px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: black;
  z-index: 10;
  position: relative;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    text-align: left;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

@media (min-width: 768px) {
  .footer-brand {
    align-items: flex-start;
  }
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-logo-glow {
  position: absolute;
  inset: 0;
  background: #a855f7;
  filter: blur(8px);
  opacity: 0.2;
  border-radius: 8px;
}

.footer-logo-icon {
  position: relative;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-brand-text {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: white;
}

.footer-tagline {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.6em;
  text-transform: uppercase;
}

.footer-links {
  display: flex;
  gap: 64px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:nth-child(1):hover {
  color: #a78bfa;
}

.footer-link:nth-child(2):hover {
  color: #60a5fa;
}

.footer-link:nth-child(3):hover {
  color: #f472b6;
}

.footer-link:nth-child(4):hover {
  color: #818cf8;
}

.footer-copyright {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.1);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
