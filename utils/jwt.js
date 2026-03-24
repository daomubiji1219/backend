// token相关模块
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// 生成JWT token
function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "ai-code-reviewer",
  });
}

// 验证JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token已过期");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("无效的Token");
    } else {
      throw new Error("Token验证失败");
    }
  }
}


// 中间件：验证accessToken（支持Bearer token和Cookie）
function authenticateToken(req, res, next) {
  let token = null;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }


  if (!token) {
    return res.status(401).json({
      success: false,
      message: "访问被拒绝，需要提供有效的accessToken",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
}

// 中间件：验证refreshToken（支持Bearer token和Cookie）
function authenticateRefreshToken(req, res, next) {
  let token = null;

  // 如果Authorization头中没有token，尝试从Cookie获取
  if ( req.cookies && req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }


  if (!token) {
    return res.status(401).json({
      success: false,
      message: "访问被拒绝，需要提供有效的refreshToken",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
}

// 中间件：验证管理员权限
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "需要管理员权限",
    });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  authenticateRefreshToken,
  requireAdmin,
};
