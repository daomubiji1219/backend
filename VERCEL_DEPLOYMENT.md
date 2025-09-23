# Vercel 部署指南

本项目已配置为支持 Vercel 部署。以下是部署步骤和注意事项。

## 项目结构说明

```
backend/
├── app.js                 # 主应用文件
├── vercel.json           # Vercel 配置文件
├── package.json          # 项目依赖和脚本
├── public/dist/          # 前端静态文件目录
├── config/               # 配置文件
├── routes/               # API 路由
├── models/               # 数据模型
└── utils/                # 工具函数
```

## 部署步骤

### 1. 准备工作

确保你的项目已经推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）。

### 2. 连接 Vercel

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择你的 Git 提供商并授权
4. 选择包含此项目的仓库
5. 配置项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: `backend` (如果项目在子目录中)
   - **Build Command**: `pnpm install` (Vercel 会自动检测)
   - **Output Directory**: `public/dist`

### 3. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

#### 必需的环境变量

```
NODE_ENV=production
DEEPSEEK_API_KEY=your_deepseek_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

#### 可选的环境变量

```
PORT=3001
SQLITE_DB_PATH=/tmp/database.sqlite
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
```

**设置步骤：**
1. 进入项目控制台
2. 点击 "Settings" 标签
3. 在左侧菜单选择 "Environment Variables"
4. 添加上述环境变量

### 4. 部署

配置完成后，Vercel 会自动开始构建和部署。你可以在 "Deployments" 页面查看部署状态。

## Vercel 配置说明

### vercel.json 配置

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
      "src": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot))",
      "dest": "/public/dist/$1"
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

### 路由配置说明

- **API 路由**: 所有 `/api/*` 请求都会被路由到 `app.js`
- **静态资源**: CSS、JS、图片等静态文件从 `public/dist` 目录提供
- **SPA 路由**: 所有其他请求都会返回 `index.html`，支持前端路由

## 注意事项

### 1. 数据库

- **SQLite**: 在 Vercel 中，SQLite 数据库存储在临时文件系统中，每次部署会重置
- **推荐**: 对于生产环境，建议使用外部数据库服务：
  - [PlanetScale](https://planetscale.com/) - MySQL 兼容
  - [Supabase](https://supabase.com/) - PostgreSQL
  - [MongoDB Atlas](https://www.mongodb.com/atlas) - MongoDB

### 2. 文件上传

- 上传的文件存储在 `/tmp` 目录，部署时会丢失
- **推荐**: 使用云存储服务：
  - [Cloudinary](https://cloudinary.com/) - 图片和视频
  - [AWS S3](https://aws.amazon.com/s3/) - 通用文件存储
  - [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) - Vercel 官方存储

### 3. 函数限制

- **执行时间**: 免费版 10 秒，Pro 版 60 秒
- **内存限制**: 1024 MB
- **请求大小**: 4.5 MB
- **响应大小**: 4.5 MB

### 4. 冷启动

- Serverless 函数可能会有冷启动延迟
- 数据库连接会在每次冷启动时重新初始化

## 本地开发

### 安装 Vercel CLI

```bash
pnpm install -g vercel
```

### 本地运行

```bash
# 启动 Vercel 开发服务器
vercel dev

# 或者使用传统方式
pnpm run dev
```

### 链接项目

```bash
# 链接到 Vercel 项目
vercel link

# 拉取环境变量
vercel env pull .env.local
```

## 故障排除

### 1. 构建失败

- 检查 `package.json` 中的依赖是否正确
- 确保 `public/dist` 目录存在且包含前端文件
- 查看构建日志中的错误信息

### 2. API 请求失败

- 检查环境变量是否正确设置
- 确认 API 路由配置正确
- 查看 Vercel Functions 日志

### 3. 静态文件 404

- 确认文件存在于 `public/dist` 目录
- 检查 `vercel.json` 中的路由配置
- 验证文件路径大小写

### 4. 数据库连接问题

- 确保数据库初始化代码正确执行
- 检查数据库连接字符串
- 考虑使用外部数据库服务

## 监控和日志

### 查看日志

```bash
# 实时查看函数日志
vercel logs [deployment-url]

# 查看特定函数日志
vercel logs [deployment-url] --follow
```

### 性能监控

- 在 Vercel 控制台查看 "Analytics" 页面
- 监控函数执行时间和错误率
- 设置告警通知

## 自定义域名

1. 在项目设置中点击 "Domains"
2. 添加自定义域名
3. 配置 DNS 记录：
   - **A 记录**: `76.76.19.61`
   - **CNAME**: `cname.vercel-dns.com`
4. Vercel 会自动提供 SSL 证书

## 更多资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Node.js Runtime 文档](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)
- [自定义域名](https://vercel.com/docs/concepts/projects/custom-domains)

## 部署检查清单

- [ ] 代码已推送到 Git 仓库
- [ ] `vercel.json` 配置正确
- [ ] 环境变量已设置
- [ ] `public/dist` 目录包含前端文件
- [ ] 数据库配置适合生产环境
- [ ] 文件上传功能使用云存储
- [ ] API 端点测试通过
- [ ] 自定义域名已配置（如需要）