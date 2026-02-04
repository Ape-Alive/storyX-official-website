<template>
  <div class="background-layer">
    <div class="bg-glow bg-glow-blue"></div>
    <div class="bg-glow bg-glow-purple"></div>
    <div class="bg-glow bg-glow-pink"></div>
    <div class="bg-grid"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.background-layer {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(180px);
}

.bg-glow-blue {
  top: -10%;
  left: -10%;
  width: 60%;
  height: 60%;
  background: rgba(37, 99, 235, 0.1);
  animation: pulse 8s ease-in-out infinite;
}

.bg-glow-purple {
  bottom: -10%;
  right: -10%;
  width: 60%;
  height: 60%;
  background: rgba(147, 51, 234, 0.1);
  animation: pulse 8s ease-in-out infinite;
  animation-delay: 2s;
}

.bg-glow-pink {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 40%;
  background: rgba(236, 72, 153, 0.05);
}

.bg-grid {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 100px 100px;
}
</style>
