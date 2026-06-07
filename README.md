# Novel Generator — Frontend

基于 AI 的网文短篇小说生成器 Web 前端（Next.js + Tailwind CSS）。

配套后端仓库：[novel-generator-backend](https://github.com/Auroraexo/novel-generator-backend)

## 快速开始

### 环境要求

- Node.js >= 20
- 已启动的后端服务（默认 `http://localhost:3001`）

### 安装与运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 http://localhost:3000

开发模式下，Next.js 会将 `/api/*` 代理到后端；也可通过 `NEXT_PUBLIC_API_URL` 直接指定后端地址。

## 项目结构

```
src/
├── app/         # 页面路由
├── components/  # UI 组件
└── lib/         # API 客户端
```

## License

MIT
