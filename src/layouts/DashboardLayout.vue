<template>
  <div class="dashboard-layout">
    <Header
      :user-email="userEmail"
      :user-name="userName"
      @logout="handleLogoutClick"
    />
    <div class="dashboard-inner">
      <Sidebar />
      <div class="dashboard-content-wrapper">
        <main class="dashboard-main">
          <div class="dashboard-container">
            <router-view />
          </div>
          <footer class="dashboard-footer">
            <div class="footer-content">
              <span>STORY-X 控制台 • V2.5.0</span>
              <span>所有算力节点运行正常</span>
              <span>© 2024 StoryX AI</span>
            </div>
          </footer>
        </main>
        <div class="desktop-app-btn">
          <div class="tooltip">打开桌面客户端</div>
          <button class="app-btn" @click="openDesktopApp">
            <div class="app-btn-icon">
              <el-icon :size="28"><Monitor /></el-icon>
              <div class="app-btn-glow"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Monitor } from "@element-plus/icons-vue";
import Sidebar from "@/components/dashboard/Sidebar.vue";
import Header from "@/components/dashboard/Header.vue";
import { getUserInfo, removeToken, removeUserInfo } from "@/utils/storage";
import { generateOneTimeToken } from "@/api/auth";

const router = useRouter();
const userEmail = ref("");
const userName = ref("");

onMounted(() => {
  const userInfo = getUserInfo();
  if (userInfo) {
    if (userInfo.email) {
      userEmail.value = userInfo.email;
    }
    if (userInfo.name) {
      userName.value = userInfo.name;
    } else if (userInfo.email) {
      // 如果没有 name，使用邮箱前缀作为用户名
      const parts = userInfo.email.split("@");
      userName.value = parts[0] || "用户";
    }
  }
});

const handleSettingsClick = () => {
  ElMessage.info("个人设置功能开发中...");
};

const handleLogoutClick = async () => {
  try {
    await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      customClass: "logout-confirm-dialog",
      center: false,
      showClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      distinguishCancelAndClose: true,
    });

    removeToken();
    removeUserInfo();
    ElMessage.success("已退出登录");
    router.push("/auth/login");
  } catch {
    // 用户取消
  }
};

const openDesktopApp = async () => {
  try {
    // 显示加载提示
    const loadingMessage = ElMessage({
      message: "正在生成登录令牌...",
      type: "info",
      duration: 0, // 不自动关闭
    });

    // 调用 API 生成一次性 token
    const response = await generateOneTimeToken({ expiresInMinutes: 10 });

    // 关闭加载提示
    loadingMessage.close();

    if (response.success && response.data && response.data.token) {
      const token = response.data.token;

      // 在浏览器中打开协议 URL
      window.location.href = `storyx://login?token=${token}`;

      ElMessage.success("已生成登录令牌，正在打开桌面客户端...");
    } else {
      ElMessage.error("生成登录令牌失败，请稍后重试");
    }
  } catch (error) {
    console.error("生成一次性 token 失败:", error);
    ElMessage.error(
      error.response?.data?.message || "生成登录令牌失败，请稍后重试",
    );
  }
};
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.dashboard-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  min-height: calc(100vh - 64px);
  gap: 16px;
  padding-top: 16px;
}

.dashboard-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
  max-width: 1208px;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.dashboard-container {
  flex: 1;
  padding: 32px;
  width: 100%;
}

.dashboard-footer {
  padding: 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 48px;
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(30, 27, 75, 0.3);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-family: "Inter", sans-serif;
}

.desktop-app-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 100;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 16px);
  right: 0;
  padding: 8px 16px;
  background: black;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s;
  pointer-events: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.desktop-app-btn:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 24px;
  width: 8px;
  height: 8px;
  background: black;
  transform: rotate(45deg) translateY(-4px);
}

.app-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(to top right, #9333ea, #ec4899);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(147, 51, 234, 0.3);
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  position: relative;
}

.app-btn:hover {
  box-shadow: 0 12px 40px rgba(147, 51, 234, 0.5);
  transform: scale(1.1);
}

.app-btn:active {
  transform: scale(0.95);
}

.app-btn-icon {
  position: relative;
  z-index: 10;
}

.app-btn-glow {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  filter: blur(24px);
  scale: 1.5;
  animation: pulse 2s infinite;
  opacity: 0.5;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
