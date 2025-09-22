# AI Code Reviewer 部署指南

## 问题诊断与解决方案

### 原始问题
在 Vercel 部署时出现白屏和 404 错误，主要原因：
1. 静态资源路由配置优先级问题
2. Express 静态文件服务配置不完善
3. SPA 路由回退机制在生产环境中未正确配置

### 解决方案

#### 1. 优化 Vercel 路由配置 (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/app.js"
    },
    {
      "src": "/vite.svg",
      "dest": "/public/dist/vite.svg"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/public/dist/assets/$1"
    },
    {
      "src": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|json))",
      "dest": "/public/dist/$1"
    },
    {
      "src": "/config.js",
      "dest": "/public/dist/config.js"
    },
    {
      "src": "/",
      "dest": "/public/dist/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/public/dist/index.html"
    }
  ]
}
```

#### 2. 改进 Express 静态文件服务
- 添加缓存控制和 ETag 禁用
- 增加静态资源调试中间件
- 完善 SPA 路由回退机制

#### 3. 确保前端构建文件完整
- 验证 `public/dist` 目录包含所有必要文件
- 确认 `index.html` 引用的资源文件都存在

## 部署步骤

### 1. 本地测试
```bash
# 启动本地服务器
pnpm start

# 访问 http://localhost:3000 验证功能
```

### 2. Vercel 部署
```bash
# 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 部署到 Vercel
vercel --prod
```

### 3. 验证部署
1. 检查主页是否正常加载
2. 验证静态资源（JS、CSS）是否正确加载
3. 测试 API 端点是否正常工作
4. 确认 SPA 路由功能正常

## 关键文件结构
```
backend/
├── app.js                 # 主应用文件
├── vercel.json           # Vercel 部署配置
├── public/
│   └── dist/             # 前端构建文件
│       ├── index.html    # 主页面
│       ├── vite.svg      # 图标
│       └── assets/       # 静态资源
│           ├── *.js      # JavaScript 文件
│           └── *.css     # 样式文件
├── routes/               # API 路由
├── models/               # 数据模型
└── config/               # 配置文件
```

## 故障排除

### 常见问题
1. **404 错误**：检查 `vercel.json` 路由配置和静态文件路径
2. **白屏问题**：确认前端构建文件完整且路径正确
3. **API 无法访问**：验证 API 路由配置和 CORS 设置

### 调试技巧
1. 查看浏览器开发者工具的网络面板
2. 检查 Vercel 部署日志
3. 使用本地环境复现问题
4. 验证环境变量配置

## 环境变量
确保在 Vercel 中配置以下环境变量：
- `NODE_ENV=production`
- `DEEPSEEK_API_KEY`
- 其他必要的 API 密钥

## 性能优化建议
1. 启用静态资源缓存
2. 使用 CDN 加速静态文件
3. 压缩 JavaScript 和 CSS 文件
4. 优化图片资源