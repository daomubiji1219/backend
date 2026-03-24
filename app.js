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
const chatRoutes = require('./routes/chat');

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public/dist')));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175', 
    'http://localhost:5174',
    'https://8.137.166.34',
    'http://36.163.170.248',
    /\.vercel\.app$/,  // 允许所有 Vercel 部署域名
    null, // 必须加：适配 Expo Go 的 Origin: null 场景
  ],
  credentials: true, // 如果需要携带 cookies
}));
// 路由fallback到index.html - 在 Vercel 中由路由配置处理
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/dist/index.html'));
// });

// 添加API配置端点
app.get('/api/config', (req, res) => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? `https://${req.get('host')}` 
    : `http://localhost:${process.env.PORT || 3001}`;
  
  res.json({
    apiBaseURL: baseURL,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 集成认证路由
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

// 集成聊天路由
app.use('/api/chat', chatRoutes);

// SPA 路由处理 - 在 Vercel 中由路由配置处理
// app.get('*', (req, res) => {
//   // 如果请求的是API路径，跳过
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ error: 'API endpoint not found' });
//   }
//   // 返回前端应用
//   res.sendFile(path.join(__dirname, 'public/dist/index.html'));
// });


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
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器已启动，端口: ${PORT}`);
      console.log(`API地址: http://localhost:${PORT}/api`);
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

// 导出给 Vercel，无需监听；仅在本地直接运行时启动服务器
if (require.main === module) {
  startServer();
}

module.exports = app;