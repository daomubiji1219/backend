// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const app = express();
const OpenAI = require('openai');
const { initDatabase } = require('./config/sqlite');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const history = require('connect-history-api-fallback');

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(history());
app.use(express.static(path.join(__dirname, 'public/dist')));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175', 
    'http://localhost:5174',
    /\.vercel\.app$/  // 允许所有 Vercel 部署域名
  ],
  credentials: true, // 如果需要携带 cookies
}));
// // 路由fallback到index.html
// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, 'public/dist/index.html'));
// });

// 集成认证路由
app.use('/api/auth', authRoutes);
app.use('/', uploadRoutes);


const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-76505256423a47af86c96269ead40c03'
});

app.post('/api/deepseek', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create(req.body);

    // const response = await axios.post('https://api.deepseek.com', req.body, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer sk-76505256423a47af86c96269ead40c03`
    //   }
    // });
    res.json(completion);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});


// 初始化数据库并启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    console.log('数据库初始化完成');
    
    // 启动服务器
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`服务器已启动，端口: ${PORT}`);
      console.log(`API地址: http://localhost:${PORT}/api`);
      console.log('认证端点:');
      console.log('  POST /api/auth/login - 用户登录');
      console.log('  POST /api/auth/register - 用户注册');
      console.log('  GET /api/auth/me - 获取当前用户信息');
      console.log('  PUT /api/auth/profile - 更新用户资料');
      console.log('  POST /api/auth/verify-token - 验证token');
      console.log('  GET /api/auth/check - 检查认证状态');
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 创建上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TEMP_DIR = path.join(__dirname, 'temp');

// 确保目录存在
const ensureDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// 初始化目录
ensureDir(UPLOAD_DIR);
ensureDir(TEMP_DIR);

// 配置multer用于处理分片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    // 生成临时文件名，稍后重命名
    const tempName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cb(null, tempName);
  }
});

const upload = multer({ storage });

startServer();