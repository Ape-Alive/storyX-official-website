# StoryX Official Website

基于 Vue3 + Vite + Pinia + Element Plus 的现代化前端项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 的状态管理库
- **Element Plus** - 基于 Vue 3 的组件库
- **Axios** - HTTP 客户端
- **Vue Router** - Vue.js 官方路由管理器

## 项目结构

```
storyX-official-website/
├── src/
│   ├── api/              # API 接口模块
│   │   └── index.js      # API 统一导出
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # Pinia 状态管理
│   │   ├── modules/      # Store 模块
│   │   │   └── user.js   # 用户状态管理
│   │   └── index.js      # Store 统一导出
│   ├── utils/            # 工具类
│   │   ├── request.js    # Axios 请求封装
│   │   ├── storage.js    # 浏览器存储工具
│   │   └── index.js      # 通用工具函数
│   ├── views/            # 页面组件
│   │   └── Home.vue
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
└── README.md             # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 功能特性

### 1. 请求封装 (`src/utils/request.js`)

- 统一的请求拦截器（自动添加 token）
- 统一的响应拦截器（错误处理）
- 支持 baseURL 配置
- 自动错误提示

### 2. 浏览器存储 (`src/utils/storage.js`)

- localStorage 和 sessionStorage 封装
- Token 管理
- 用户信息管理
- 支持持久化存储和会话存储

### 3. 工具函数 (`src/utils/index.js`)

- 防抖和节流
- 深拷贝
- 日期格式化
- 数字格式化
- URL 参数获取
- 文件下载等常用工具函数

### 4. 状态管理 (`src/stores/`)

- 基于 Pinia 的模块化状态管理
- 用户状态管理示例
- 支持持久化

### 5. API 管理 (`src/api/`)

- 按业务模块划分的 API 接口
- 统一的请求方法封装
- 便于维护和扩展

## 环境变量

项目支持环境变量配置，在 `.env.development` 和 `.env.production` 中配置：

- `VITE_API_BASE_URL` - API 基础地址

## 开发规范

1. **组件命名**：使用 PascalCase
2. **文件命名**：使用 kebab-case
3. **API 接口**：按业务模块划分，统一在 `src/api/` 目录下管理
4. **状态管理**：使用 Pinia，按模块划分 store
5. **工具函数**：统一放在 `src/utils/` 目录下

## License

MIT
