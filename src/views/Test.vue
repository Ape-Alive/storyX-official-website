<template>
  <div style="padding: 50px; color: white; background: #020205; min-height: 100vh;">
    <h1>测试页面</h1>
    <p>如果你能看到这个页面，说明 Vue 应用正常运行</p>
    <button @click="testClick" style="padding: 10px 20px; margin-top: 20px;">
      测试按钮
    </button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const testClick = () => {
  ElMessage.success('测试成功！')
}
</script>
