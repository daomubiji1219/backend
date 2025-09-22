# MySQL 数据库设置指南

## 1. 安装 MySQL

### Windows:
1. 下载 MySQL Installer: https://dev.mysql.com/downloads/installer/
2. 运行安装程序，选择 "Developer Default" 安装类型
3. 设置 root 用户密码（请记住这个密码）
4. 完成安装

### 使用 XAMPP (推荐新手):
1. 下载 XAMPP: https://www.apachefriends.org/
2. 安装并启动 XAMPP Control Panel
3. 启动 MySQL 服务
4. 默认情况下，root 用户没有密码

## 2. 配置数据库连接

### 步骤 1: 更新 .env 文件
编辑 `backend/.env` 文件，设置正确的数据库密码：

```env
# 如果使用 XAMPP（默认无密码）
DB_PASSWORD=

# 如果设置了 MySQL root 密码
DB_PASSWORD=your_actual_password
```

### 步骤 2: 创建数据库
打开 MySQL 命令行或 phpMyAdmin，执行：

```sql
CREATE DATABASE ai_code_reviewer;
```

### 步骤 3: 测试连接
运行测试脚本：

```bash
node test-db-connection.js
```

## 3. 常见问题解决

### 问题 1: "Access denied for user 'root'@'localhost'"
**解决方案:**
- 检查 `.env` 文件中的 `DB_PASSWORD` 是否正确
- 如果使用 XAMPP，密码通常为空
- 如果忘记密码，可以重置 MySQL root 密码

### 问题 2: "ECONNREFUSED"
**解决方案:**
- 确保 MySQL 服务正在运行
- 检查端口 3306 是否被占用
- 在 XAMPP 中启动 MySQL 服务

### 问题 3: "Unknown database 'ai_code_reviewer'"
**解决方案:**
- 手动创建数据库：`CREATE DATABASE ai_code_reviewer;`

## 4. 验证安装

成功连接后，你应该看到类似输出：

```
开始测试数据库连接...
1. 测试数据库连接...
✅ 数据库连接成功!
2. 测试数据库查询...
✅ 数据库查询成功: [ { test: 1 } ]
3. 初始化数据库表...
默认管理员账户已创建: username=admin, password=admin123
数据库初始化完成
✅ 数据库初始化完成!
4. 测试用户表查询...
✅ 用户表查询成功，当前用户数量: 1

🎉 所有数据库测试通过!
```

## 5. 下一步

数据库连接成功后，你可以：
1. 启动后端服务：`npm run dev`
2. 使用默认管理员账户登录：
   - 用户名: `admin`
   - 密码: `admin123`