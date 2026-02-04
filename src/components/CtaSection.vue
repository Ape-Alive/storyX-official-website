<template>
  <section id="pricing" class="cta-section">
    <div class="cta-bg-purple"></div>
    <div class="cta-bg-blue"></div>

    <div class="cta-container">
      <h2 class="cta-title">
        加入影视<br />
        <span class="cta-title-gradient">生产力革命</span>
      </h2>
      <p class="cta-desc">
        影视制作的门槛已被彻底打破。<br/>无论你是编剧、小说家还是短剧导演，现在就开始创作。
      </p>
      <div class="cta-actions">
        <button class="cta-primary-btn" @click="$emit('cta-click')">
          获取优先体验
        </button>
        <button class="cta-secondary-btn" @click="$emit('custom-click')">
          查看工作室定制方案
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineEmits(['cta-click', 'custom-click'])
</script>

<style scoped>
.cta-section {
  padding: 256px 32px;
  background: white;
  position: relative;
  overflow: hidden;
}

.cta-bg-purple {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 50%;
  background: #e9d5ff;
  filter: blur(150px);
  opacity: 0.3;
  border-radius: 50%;
}

.cta-bg-blue {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 50%;
  background: #bfdbfe;
  filter: blur(150px);
  opacity: 0.3;
  border-radius: 50%;
}

.cta-container {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 10;
}

.cta-title {
  font-size: 80px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 80px;
  color: black;
  font-family: 'Space Grotesk', sans-serif;
  animation: fadeInUp 0.8s ease-out;
}

@media (min-width: 768px) {
  .cta-title {
    font-size: 180px;
  }
}

.cta-title-gradient {
  display: inline-block;
  margin-top: 0.2em;
  background: linear-gradient(120deg, #2563eb, #9333ea, #db2777, #ec4899);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 300;
  font-style: italic;
  animation: gradientShift 3s ease infinite;
}

.cta-desc {
  color: rgba(0, 0, 0, 0.6);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.15em;
  margin-bottom: 96px;
  max-width: 512px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.8;
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@media (min-width: 768px) {
  .cta-desc {
    font-size: 28px;
  }
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 56px;
}

@media (min-width: 768px) {
  .cta-actions {
    flex-direction: row;
  }
}

.cta-primary-btn {
  background: black;
  color: white;
  padding: 32px 80px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.3em;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.cta-primary-btn:hover {
  transform: translateY(-6px) scale(1.08);
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.4);
}

.cta-primary-btn:active {
  transform: translateY(-3px) scale(1.05);
}

.cta-secondary-btn {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2em;
  border-bottom: 2px solid rgba(0, 0, 0, 0.15);
  padding-bottom: 8px;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.7);
  font-family: 'Inter', sans-serif;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.cta-secondary-btn:hover {
  border-bottom-color: #9333ea;
  color: black;
  transform: translateY(-2px);
}
</style>
