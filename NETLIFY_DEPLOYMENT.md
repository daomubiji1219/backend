# Netlify 部署指南

本项目已配置为支持 Netlify 部署。以下是部署步骤和注意事项。

## 部署步骤

### 1. 准备工作

确保你的项目已经推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）。

### 2. 连接 Netlify

1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择你的 Git 提供商并授权
4. 选择包含此项目的仓库

### 3. 配置构建设置

Netlify 会自动检测 `netlify.toml` 配置文件，但你也可以手动确认：

- **Build command**: `pnpm install && pnpm run build`
- **Publish directory**: `public/dist`
- **Functions directory**: `netlify/functions`

### 4. 环境变量配置

在 Netlify 控制台中设置以下环境变量：

#### 必需的环境变量

```
NODE_ENV=production
DEEPSEEK_API_KEY=your_deepseek_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

#### 可选的环境变量

```
SQLITE_DB_PATH=/tmp/database.sqlite
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
ALLOWED_ORIGINS=https://your-app.netlify.app
```

**设置步骤：**
1. 进入你的站点控制台
2. 点击 "Site settings"
3. 在左侧菜单选择 "Environment variables"
4. 点击 "Add variable" 添加上述变量

### 5. 部署

配置完成后，Netlify 会自动开始构建和部署。你可以在 "Deploys" 页面查看部署状态。

## 项目结构说明

### 配置文件

- `netlify.toml` - Netlify 部署配置
- `netlify/functions/api.js` - 后端 API 作为 Netlify Function
- `.env.netlify.example` - 环境变量示例

### API 路由

所有 API 请求会被重定向到 Netlify Functions：
- `/api/*` → `/.netlify/functions/api/*`

### 静态文件

前端静态文件从 `public/dist` 目录提供服务。

## 注意事项

### 1. 数据库

- **SQLite**: 在 Netlify Functions 中，SQLite 数据库存储在 `/tmp` 目录，每次函数冷启动时会重置
- **推荐**: 对于生产环境，建议使用外部数据库服务（如 PlanetScale、Supabase 等）

### 2. 文件上传

- 上传的文件存储在 `/tmp` 目录，函数重启时会丢失
- **推荐**: 使用云存储服务（如 Cloudinary、AWS S3 等）

### 3. 函数限制

- Netlify Functions 有执行时间限制（免费版 10 秒，付费版 15 分钟）
- 内存限制：1008 MB
- 请求大小限制：6 MB

### 4. 冷启动

- Functions 可能会有冷启动延迟
- 数据库连接会在每次冷启动时重新初始化

## 本地开发

### 安装 Netlify CLI

```bash
pnpm install -g netlify-cli
```

### 本地运行

```bash
# 启动 Netlify 开发服务器
pnpm run netlify:dev

# 或者直接使用 Netlify CLI
netlify dev
```

这会启动本地开发服务器，模拟 Netlify 的生产环境。

## 故障排除

### 1. 构建失败

- 检查 `package.json` 中的依赖是否正确
- 确保 `public/dist` 目录存在且包含前端文件

### 2. API 请求失败

- 检查环境变量是否正确设置
- 查看 Netlify Functions 日志

### 3. 数据库连接问题

- 确保数据库初始化代码在 Functions 中正确执行
- 检查数据库文件路径配置

## 监控和日志

- 在 Netlify 控制台的 "Functions" 页面可以查看函数日志
- 使用 "Analytics" 页面监控站点性能
- 设置 "Notifications" 接收部署状态通知

## 自定义域名

1. 在 "Domain settings" 中添加自定义域名
2. 配置 DNS 记录指向 Netlify
3. Netlify 会自动提供 SSL 证书

## 更多资源

- [Netlify 官方文档](https://docs.netlify.com/)
- [Netlify Functions 文档](https://docs.netlify.com/functions/overview/)
- [环境变量配置](https://docs.netlify.com/environment-variables/overview/)