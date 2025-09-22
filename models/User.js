// models/User.js
const bcrypt = require('bcryptjs');
const { db } = require('../config/sqlite');
const crypto = require('crypto');

// 生成UUID的简单实现
function generateUUID() {
  return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

class User {
  // 根据用户名查找用户
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error('查找用户失败:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          console.error('查找用户失败:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // 根据ID查找用户
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, avatar, role, created_at, last_login_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('查找用户失败:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // 创建新用户
  static async create(userData) {
    const { username, email, password, avatar = null, role = 'user' } = userData;
    
    try {
      // 检查用户名是否已存在
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 检查邮箱是否已存在
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new Error('邮箱已被注册');
      }

      // 生成用户ID和密码哈希
      const userId = generateUUID();
      const passwordHash = await bcrypt.hash(password, 10);

      // 插入新用户
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, username, email, password_hash, avatar, role) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, username, email, passwordHash, avatar, role],
          async function(err) {
            if (err) {
              console.error('创建用户失败:', err);
              reject(new Error('创建用户失败: ' + err.message));
            } else {
              try {
                const newUser = await User.findById(userId);
                resolve(newUser);
              } catch (findError) {
                reject(findError);
              }
            }
          }
        );
      });
    } catch (error) {
      throw new Error('创建用户失败: ' + error.message);
    }
  }

  // 验证用户密码
  static async validatePassword(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return null;
      }

      // 更新最后登录时间
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id],
          (err) => {
            if (err) {
              console.error('更新登录时间失败:', err);
              reject(new Error('更新登录时间失败: ' + err.message));
            } else {
              // 返回用户信息（不包含密码）
              const { password_hash, ...userWithoutPassword } = user;
              resolve(userWithoutPassword);
            }
          }
        );
      });
    } catch (error) {
      throw new Error('验证密码失败: ' + error.message);
    }
  }

  // 更新用户信息
  static async updateProfile(userId, updates) {
    const allowedFields = ['username', 'email', 'avatar'];
    const updateFields = [];
    const updateValues = [];

    // 过滤允许更新的字段
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('没有有效的更新字段');
    }

    try {
      // 如果更新用户名或邮箱，需要检查是否已存在
      if (updates.username) {
        const existingUser = await this.findByUsername(updates.username);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('用户名已被使用');
        }
      }

      if (updates.email) {
        const existingEmail = await this.findByEmail(updates.email);
        if (existingEmail && existingEmail.id !== userId) {
          throw new Error('邮箱已被使用');
        }
      }

      updateValues.push(userId);
      const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      return new Promise((resolve, reject) => {
        db.run(sql, updateValues, async (err) => {
          if (err) {
            console.error('更新用户信息失败:', err);
            reject(new Error('更新用户信息失败: ' + err.message));
          } else {
            try {
              const updatedUser = await User.findById(userId);
              resolve(updatedUser);
            } catch (findError) {
              reject(findError);
            }
          }
        });
      });
    } catch (error) {
      throw new Error('更新用户信息失败: ' + error.message);
    }
  }
}

module.exports = User;