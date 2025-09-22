# AI Code Reviewer Backend

这是 AI Code Reviewer 项目的后端服务，基于 Node.js 和 Express 框架开发。

## 快速开始

### 1. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 2. 数据库设置

#### 方法一：一键设置（推荐）
```bash
npm run setup
```

#### 方法二：手动设置
1. 确保 MySQL 服务正在运行
2. 创建数据库：
   ```bash
   npm run db:create
   ```
3. 测试连接：
   ```bash
   npm run db:test
   ```

### 3. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## 可用脚本

- `npm run setup` - 一键设置项目（安装依赖、创建数据库、测试连接）
- `npm run dev` - 启动开发服务器
- `npm start` - 启动生产服务器
- `npm run db:create` - 创建数据库
- `npm run db:test` - 测试数据库连接

## 环境配置

项目使用 `.env` 文件进行环境配置，主要配置项：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_code_reviewer

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3000
NODE_ENV=development

# OpenAI配置
OPENAI_API_KEY=your-openai-api-key
```

## 默认管理员账户

数据库初始化后会自动创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

## 故障排除

如果遇到数据库连接问题，请查看 [DATABASE_SETUP.md](./DATABASE_SETUP.md) 获取详细的设置指南。

常见问题：
1. **MySQL 服务未运行** - 启动 MySQL 服务或 XAMPP
2. **密码错误** - 检查 `.env` 文件中的 `DB_PASSWORD`
3. **数据库不存在** - 运行 `npm run db:create`

## 技术栈

- **框架**: Express.js
- **数据库**: MySQL
- **ORM**: mysql2
- **认证**: JWT + bcryptjs
- **开发工具**: nodemon
- **AI服务**: OpenAI API

## 项目结构

```
backend/
├── config/
│   └── database.js          # 数据库配置
├── .env                     # 环境变量
├── package.json            # 项目配置
├── app.js                  # 主应用文件
├── setup.js                # 一键设置脚本
├── create-database.js      # 数据库创建脚本
├── test-db-connection.js   # 数据库测试脚本
├── DATABASE_SETUP.md       # 数据库设置指南
└── README.md              # 项目说明
```

基于 Node.js + Express + MySQL 的后端API服务，提供用户认证和AI代码审查功能。

## 功能特性

- 🔐 用户认证系统（注册、登录、JWT）
- 🗄️ MySQL 数据库集成
- 🔒 bcryptjs 密码加密
- 🚀 Express.js RESTful API
- 🤖 OpenAI/DeepSeek API 集成
- ⚡ 连接池优化
- 🛡️ 安全中间件

## 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 pnpm

## 快速开始

### 1. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐）
pnpm install
```

### 2. 数据库设置

#### 方法一：自动初始化（推荐）
1. 确保 MySQL 服务正在运行
2. 创建数据库：
   ```sql
   CREATE DATABASE ai_code_reviewer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 配置 `.env` 文件（见下一步）
4. 启动服务器，程序会自动创建表和默认管理员账户

#### 方法二：手动执行SQL脚本
```bash
mysql -u root -p < database.sql
```

### 3. 环境配置

复制并编辑 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_code_reviewer

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=4000

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.deepseek.com
```

### 4. 启动服务

```bash
# 开发模式（自动重启）
npm run dev
# 或
pnpm dev

# 生产模式
npm start
# 或
pnpm start
```

服务器启动后，访问：
- 健康检查：http://localhost:4000/api/health
- API文档：http://localhost:4000/api/auth

## API 接口

### 认证相关

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| GET | `/api/auth/me` | 获取当前用户信息 | ✅ |
| PUT | `/api/auth/profile` | 更新用户资料 | ✅ |
| POST | `/api/auth/verify-token` | 验证Token有效性 | ✅ |

### 用户注册
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 用户登录
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 认证请求头
```bash
Authorization: Bearer <your_jwt_token>
```

## 默认账户

系统会自动创建默认管理员账户：
- 用户名：`admin`
- 密码：`admin123`
- 角色：`admin`

**⚠️ 生产环境请立即修改默认密码！**

## 数据库结构

### users 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | VARCHAR(36) | 用户ID（主键） |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(100) | 邮箱（唯一） |
| password_hash | VARCHAR(255) | 密码哈希 |
| avatar | VARCHAR(255) | 头像URL |
| role | ENUM | 用户角色（admin/user） |
| created_at | TIMESTAMP | 创建时间 |
| last_login_at | TIMESTAMP | 最后登录时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 安全特性

- ✅ bcryptjs 密码加密（12轮）
- ✅ JWT Token 认证
- ✅ CORS 跨域保护
- ✅ 输入验证和清理
- ✅ SQL注入防护（参数化查询）
- ✅ 错误信息脱敏
- ✅ 请求体大小限制

## 开发说明

### 项目结构
```
backend/
├── config/
│   └── database.js      # 数据库配置
├── models/
│   └── User.js          # 用户模型
├── routes/
│   └── auth.js          # 认证路由
├── utils/
│   └── jwt.js           # JWT工具
├── .env                 # 环境变量
├── app.js               # 主应用文件
├── database.sql         # 数据库初始化脚本
└── package.json         # 项目配置
```

### 添加新的API路由
1. 在 `routes/` 目录创建新的路由文件
2. 在 `app.js` 中引入并使用路由
3. 如需数据库操作，在 `models/` 目录创建对应模型

### 环境变量说明
- `DB_*`: 数据库连接配置
- `JWT_*`: JWT Token 配置
- `PORT`: 服务器端口
- `OPENAI_*`: AI服务配置

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 验证 `.env` 中的数据库配置
   - 确认数据库用户权限

2. **JWT Token 错误**
   - 检查 `JWT_SECRET` 是否设置
   - 验证Token格式：`Bearer <token>`

3. **端口占用**
   - 修改 `.env` 中的 `PORT` 配置
   - 或终止占用端口的进程

### 日志查看
服务器会输出详细的日志信息，包括：
- 数据库连接状态
- API请求日志
- 错误信息

## 部署建议

### 生产环境
1. 使用 PM2 进程管理
2. 配置 Nginx 反向代理
3. 启用 HTTPS
4. 设置环境变量
5. 定期备份数据库

### Docker 部署
```dockerfile
# Dockerfile 示例
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 许可证

MIT License