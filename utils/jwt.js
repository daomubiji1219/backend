// token相关模块
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 生成JWT token
function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ai-code-reviewer'
  });
}

// 验证JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token已过期');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('无效的Token');
    } else {
      throw new Error('Token验证失败');
    }
  }
}

// 从请求头中提取token
function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

// 中间件：验证token（支持Bearer token和Cookie）
function authenticateToken(req, res, next) {
  let token = null;
  
  // 首先尝试从Authorization头获取token
  const authHeader = req.headers['authorization'];
  token = extractTokenFromHeader(authHeader);
  
  // 如果Authorization头中没有token，尝试从Cookie获取
  if (!token && req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }
  
  // 如果还是没有token，尝试从请求体获取（用于某些特殊情况）
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '访问被拒绝，需要提供有效的token' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: error.message 
    });
  }
}

// 中间件：验证管理员权限
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '需要管理员权限' 
    });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  authenticateToken,
  requireAdmin
};