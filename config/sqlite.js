// config/sqlite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// 数据库文件路径 - 适配 Netlify Functions
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'database.sqlite');

// 确保数据库目录存在（在 Netlify Functions 中）
const fs = require('fs');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    console.warn('无法创建数据库目录:', error.message);
  }
}

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('连接SQLite数据库失败:', err.message);
  } else {
    console.log('已连接到SQLite数据库');
  }
});

// 初始化数据库表
function initDatabase() {
  return new Promise((resolve, reject) => {
    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('创建用户表失败:', err.message);
        reject(err);
      } else {
        console.log('用户表创建成功或已存在');
        
        // 检查是否存在默认管理员账户
        db.get('SELECT id FROM users WHERE username = ? AND role = ?', ['admin', 'admin'], (err, row) => {
          if (err) {
            console.error('查询管理员账户失败:', err.message);
            reject(err);
          } else if (!row) {
            // 创建默认管理员账户
            const bcrypt = require('bcryptjs');
            bcrypt.hash('admin123', 12, (err, hash) => {
              if (err) {
                console.error('密码加密失败:', err.message);
                reject(err);
              } else {
                const adminId = 'admin-' + Date.now();
                db.run(
                  'INSERT INTO users (id, username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
                  [adminId, 'admin', 'admin@example.com', hash, 'admin'],
                  (err) => {
                    if (err) {
                      console.error('创建管理员账户失败:', err.message);
                      reject(err);
                    } else {
                      console.log('默认管理员账户创建成功 (用户名: admin, 密码: admin123)');
                      resolve();
                    }
                  }
                );
              }
            });
          } else {
            console.log('管理员账户已存在');
            resolve();
          }
        });
      }
    });
  });
}

// 关闭数据库连接
function closeDatabase() {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
      resolve();
    });
  });
}

module.exports = {
  db,
  initDatabase,
  closeDatabase
};