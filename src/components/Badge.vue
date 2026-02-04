<template>
  <div class="badge">
    <span class="badge-text">
      <slot />
    </span>
  </div>
</template>

<script setup>
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 10px 24px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.2);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.8s ease-out;
  transition: all 0.3s;
}

.badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.3);
}

.badge-text {
  background: linear-gradient(to right, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
